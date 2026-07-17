# Giải thích luồng hoạt động của `/dashboard` và Dockview

Tài liệu này mô tả **code đang chạy trong repository**, không mô tả kiến trúc lý tưởng trong file đặc tả. Trọng tâm là cách trang `/dashboard` chuẩn bị dữ liệu, cách Dockview tạo và điều khiển các panel, cũng như cách layout được lưu theo từng người dùng.

> Phiên bản được đọc khi viết tài liệu: `dockview-react@7.0.2`.

## 1. Hiểu nhanh trong một phút

`/dashboard` có hai trách nhiệm tách biệt:

1. `app/dashboard/page.tsx` chạy ở server, kiểm tra session, đọc dữ liệu portfolio từ PostgreSQL, tính toán và format dữ liệu.
2. `DashboardDockLayout` chạy ở client, dùng Dockview để quyết định **widget nào nằm ở đâu, kích thước bao nhiêu, widget nào đang bị thu nhỏ**.

Điểm quan trọng nhất:

- Dockview **không lấy dữ liệu tài chính**.
- Dockview **không tự lưu layout vào database**.
- Dockview chỉ quản lý cây bố cục và vòng đời các panel ở trình duyệt.
- Code FinOps gọi `api.toJSON()` để lấy layout rồi tự gửi nó qua Server Action.
- Khi tải lại trang, FinOps đọc layout từ database rồi gọi `api.fromJSON()` để dựng lại.
- Mobile dùng phần JSX cố định của `page.tsx`; giao diện Dockview chỉ được hiển thị từ breakpoint `lg`.

Luồng tổng quát:

```text
Request /dashboard
        │
        ▼
DashboardPage (Server Component)
  ├─ kiểm tra session
  ├─ đọc portfolio + orders
  ├─ đọc dashboardLayout của user
  ├─ tính và format DashboardDockData
  └─ render AppShell
        │
        ├─ desktop: DashboardDockLayout (Client Component)
        │              │
        │              ├─ fromJSON(layout đã lưu), hoặc
        │              └─ addDefaultPanels(layout mặc định)
        │
        └─ mobile: dashboard JSX cố định
```

## 2. Bản đồ các file liên quan

| File | Trách nhiệm |
| --- | --- |
| `app/dashboard/page.tsx` | Route `/dashboard`, xác thực, đọc và tính dữ liệu, chia giao diện desktop/mobile |
| `components/dashboard/dashboard-dock-layout.tsx` | Toàn bộ logic Dockview phía client |
| `components/dashboard/dashboard-dockview.css` | Theme, panel, tab, splitter, drag ghost và drop target của Dockview |
| `components/dashboard/equity-bars.tsx` | Nội dung biểu đồ cột của widget Equity curve |
| `lib/dashboard-layout.ts` | Zod schema và type của payload layout được lưu |
| `app/actions/dashboard-layout.ts` | Server Action nhận yêu cầu lưu layout |
| `server/services/query.service.ts` | Đọc layout và portfolio snapshot từ database |
| `server/services/operations.service.ts` | Validate, lưu layout và ghi audit log |
| `server/repositories/settings.repository.ts` | Đọc/upsert bản ghi `user_settings` |
| `server/db/schema/settings.ts` | Cột JSONB `user_settings.preferences` chứa layout |
| `components/shell/app-shell.tsx` | Cấp vùng chiều cao cho Dashboard bên trong sidebar/topbar |
| `app/globals.css` | Import CSS gốc của Dockview trước CSS tùy biến FinOps |

## 3. Các khái niệm Dockview cần nắm

### 3.1 Panel

Panel là một widget, ví dụ `watchlist` hoặc `equity-curve`.

Mỗi panel có:

- `id`: định danh duy nhất của instance, ví dụ `"equity-curve"`;
- `component`: tên renderer, ví dụ `"equityCurve"`;
- `title`: chữ hiển thị trên tab, ví dụ `"Equity curve"`;
- `api`: API của panel hiện tại, dùng để lấy group, maximize hoặc restore.

`id` và `component` không phải cùng một thứ:

```ts
{
  id: "equity-curve",       // instance cụ thể
  component: "equityCurve", // khóa tra renderer React
  title: "Equity curve",
}
```

### 3.2 Group

Group là một ô trong lưới Dockview. Một group có thể chứa:

- một panel; hoặc
- nhiều panel xếp thành các tab.

Khi thả một panel vào vị trí `center` của group khác, panel được đưa vào cùng group và trở thành một tab. Khi thả vào `left`, `right`, `top` hoặc `bottom`, Dockview tạo nhánh chia mới trong lưới.

### 3.3 Grid và splitter

Grid là cây bố cục chứa các group. Splitter/sash là đường phân cách giữa các nhánh. Dockview tự xử lý phép kéo splitter và cập nhật kích thước trong cây layout.

### 3.4 Dockview API

`DockviewApi` là đối tượng điều khiển workspace. Code hiện tại dùng các hàm chính:

| API | Tác dụng trong FinOps |
| --- | --- |
| `addPanel()` | Thêm widget vào layout |
| `getPanel()` | Tìm widget theo ID |
| `removePanel()` | Bỏ widget khỏi cây Dockview khi minimize |
| `clear()` | Xóa layout hiện tại trước khi dựng layout mặc định |
| `toJSON()` | Serialize cây layout hiện tại |
| `fromJSON()` | Dựng lại cây layout từ JSON |
| `updateOptions({ locked })` | Khóa/mở thao tác thay đổi layout |

## 4. Luồng server của `/dashboard`

Entry point là `DashboardPage()` trong `app/dashboard/page.tsx`. Đây là `async Server Component` vì file không có `"use client"`.

### Bước 1: kiểm tra session

```ts
const user = await getDemoSession();
if (!user) redirect("/login");
```

`getDemoSession()` đọc cookie `finops_demo_session`, sau đó tìm user đang active. Không có session hợp lệ thì route dừng và redirect sang `/login`.

### Bước 2: đọc dữ liệu nghiệp vụ và layout

```ts
const snapshot = await getPortfolioSnapshot(user.id, user.name);
if (!snapshot) redirect("/login");
const dashboardLayout = await getDashboardLayout(user.id);
```

Hai loại dữ liệu này độc lập:

- `snapshot`: số dư, buying power, positions và orders;
- `dashboardLayout`: preference giao diện riêng của user.

Nếu user chưa có layout hoặc layout không qua được Zod schema, `getDashboardLayout()` trả về `null`.

### Bước 3: tính dữ liệu hiển thị

Server tính:

- portfolio tổng hợp bằng `calculatePortfolio()`;
- Day P&L bằng tổng `position.dayPnl`;
- open orders và pending orders;
- bốn holdings lớn nhất theo `marketValue`;
- ba metric: Buying power, Day P&L và Open orders;
- năm mã đầu tiên từ `marketInstruments` cho watchlist.

Sau đó số được format thành chuỗi VND/phần trăm trước khi truyền xuống client.

### Bước 4: tạo contract cho Dockview

`dockData` có type `DashboardDockData`:

```ts
interface DashboardDockData {
  netAssetValue: string;
  totalReturn: string;
  totalReturnPercent: string;
  netDirection: "up" | "down";
  metrics: DashboardMetric[];
  watchlist: WatchQuote[];
  holdings: Holding[];
}
```

Đây là dữ liệu thuần, serialize được qua ranh giới Server Component → Client Component. Dockview không cần biết cách tính NAV, P&L hay market value.

### Bước 5: chọn giao diện theo breakpoint

```tsx
<div className="hidden h-full min-h-0 lg:block">
  <DashboardDockLayout data={dockData} initialLayout={dashboardLayout} />
</div>

<main className="... lg:hidden">
  {/* mobile dashboard cố định */}
</main>
```

Từ `lg` trở lên, người dùng thấy Dockview. Dưới `lg`, người dùng thấy dashboard mobile cố định.

Lưu ý kỹ: cả hai nhánh vẫn có trong React tree; Tailwind chỉ đổi `display` bằng CSS. Vì vậy ở mobile, `DashboardDockLayout` có thể vẫn hydrate/khởi tạo trong phần tử `display: none`, dù người dùng không nhìn thấy nó.

## 5. Cách các widget React được đăng ký với Dockview

FinOps có bốn widget:

```ts
const PANEL_META = {
  "account-overview": { component: "accountOverview", title: "Account overview" },
  "equity-curve": { component: "equityCurve", title: "Equity curve" },
  watchlist: { component: "watchlist", title: "Watchlist" },
  "top-holdings": { component: "topHoldings", title: "Top holdings" },
} as const;
```

Và bảng renderer tương ứng:

```ts
const components = {
  accountOverview: AccountOverviewPanel,
  equityCurve: EquityCurvePanel,
  watchlist: WatchlistPanel,
  topHoldings: TopHoldingsPanel,
};
```

`DockviewReact` nhận bảng này qua prop `components`:

```tsx
<DockviewReact components={components} />
```

Khi gặp panel có `component: "watchlist"`, Dockview tra `components.watchlist` và render `WatchlistPanel`.

### Vì sao dữ liệu không truyền qua `params` của từng panel?

Code dùng React Context:

```ts
const DashboardPanelContext = createContext<{
  data: DashboardDockData;
  edit: EditState;
} | null>(null);
```

`DockviewReact` được bọc trong provider:

```tsx
<DashboardPanelContext value={{ data, edit: editState }}>
  <DockviewReact ... />
</DashboardPanelContext>
```

Mỗi widget gọi `useDashboardPanel()` để lấy:

- `data`: dữ liệu portfolio/watchlist/holdings;
- `edit`: trạng thái drag/drop và hàm minimize.

Nhờ vậy, JSON layout chỉ giữ cấu trúc UI; nó không phải chứa dữ liệu tài chính dễ cũ.

## 6. Khởi tạo Dockview qua `onReady`

Dockview tạo API sau khi vùng DOM sẵn sàng, rồi gọi callback `onReady`.

```ts
const onReady = useCallback((event: DockviewReadyEvent) => {
  const nextApi = event.api;
  // khôi phục hoặc tạo layout
  // đăng ký các event drag/drop
  setApi(nextApi);
}, [initialLayout]);
```

Thứ tự khởi tạo thực tế:

1. Lấy `event.api`.
2. Nếu có `initialLayout`, gọi `nextApi.fromJSON(...)`.
3. Nếu chưa có layout, gọi `addDefaultPanels(nextApi)`.
4. Nếu `fromJSON()` throw do JSON không tương thích/hỏng, fallback sang layout mặc định.
5. Khóa layout bằng `updateOptions({ locked: true })`.
6. Đăng ký event drag/drop.
7. Đưa API vào React state bằng `setApi(nextApi)`.

### Layout mặc định được tạo thế nào?

`addDefaultPanels()` luôn bắt đầu bằng `api.clear()`, sau đó thêm bốn panel:

```text
┌─────────────────────────────────────────────┐
│ Account overview                            │
├──────────────────────────────┬──────────────┤
│ Equity curve                 │ Watchlist    │
├──────────────────────────────┴──────────────┤
│ Top holdings                                │
└─────────────────────────────────────────────┘
```

Cách code tạo cấu trúc:

1. `account-overview` được thêm đầu tiên.
2. `equity-curve` được đặt `below` account.
3. `watchlist` được đặt `right` của equity.
4. `top-holdings` dùng vị trí tuyệt đối `below`, tức một hàng ở cạnh dưới của toàn grid.

Sau khi browser có frame kế tiếp, code chỉnh kích thước ban đầu:

```ts
requestAnimationFrame(() => {
  account.group.api.setSize({ height: 190 });
  watchlist.group.api.setSize({ width: 390 });
  holdings.group.api.setSize({ height: 210 });
});
```

`requestAnimationFrame` được dùng vì Dockview cần hoàn tất đo container và dựng grid trước khi nhận kích thước mong muốn.

## 7. Các state trong `DashboardDockLayout`

| State/ref | Ý nghĩa |
| --- | --- |
| `api` | Dockview API sau `onReady`; trước đó các thao tác đều bị bỏ qua |
| `editing` | Đang ở chế độ sửa layout hay không |
| `draggingPanelId` | ID panel đang được kéo |
| `target` | Group và hướng thả hiện tại |
| `minimizedPanelIds` | Các widget đã bị gỡ khỏi Dockview và đang nằm trong menu Add Widget |
| `message` | Thông báo Reset/Save/lỗi save |
| `isPending` | Server Action lưu layout đang chạy |
| `beforeEdit` | Snapshot layout ngay trước khi vào edit, dùng cho Cancel/Escape |

`editState` là object được `useMemo()` từ các state trên rồi cấp xuống Context. Mục đích là để panel/tab có đủ trạng thái tương tác mà không phải prop-drill qua Dockview.

## 8. View mode và Edit mode

Dockview được khóa/mở theo `editing`:

```ts
useEffect(() => {
  api?.updateOptions({ locked: !editing });
}, [api, editing]);
```

### Khi chưa edit

- `locked: true`;
- splitter bị CSS chặn `pointer-events`;
- header hiển thị `Add Widget` và `Customize layout`;
- người dùng vẫn có thể gọi các action riêng trên tab như minimize/maximize vì đó là các lệnh API do code FinOps chủ động gọi.

### Khi bấm Customize layout

Code chụp snapshot **trong bộ nhớ trình duyệt**:

```ts
beforeEdit.current = {
  dockview: api.toJSON(),
  minimized: minimizedPanelIds,
};
setEditing(true);
```

Sau đó:

- Dockview được mở khóa;
- toolbar Reset/Cancel/Save xuất hiện;
- splitter có thể resize;
- tab có thể kéo từ grip;
- `Escape` được đăng ký trên `document` để gọi Cancel.

### Sơ đồ trạng thái edit

```text
VIEW
 │ Customize layout
 │ chụp beforeEdit
 ▼
EDITING ── Reset ──► layout mặc định trong client, chưa lưu
 │
 ├─ Cancel hoặc Escape ──► fromJSON(beforeEdit) ──► VIEW
 │
 └─ Save ──► server action thành công ──► VIEW
```

`Cancel` không đọc lại database. Nó quay về snapshot lúc vừa bấm Customize.

## 9. Drag và drop diễn ra thế nào?

Dockview thực hiện việc di chuyển panel thật. Code FinOps chỉ bổ sung giao diện phản hồi theo thiết kế.

### Bước 1: chỉ cho kéo từ grip

`DashboardTab` chặn `pointerdown` nếu mục tiêu không nằm trong `[data-dock-grip]`:

```ts
if (!(event.target as Element).closest("[data-dock-grip]")) {
  event.stopPropagation();
}
```

Nhờ đó bấm title hoặc các nút action không vô tình bắt đầu drag. Khi edit, grip có `tabIndex={0}`; ngoài edit, nó có `tabIndex={-1}`.

### Bước 2: `onWillDragPanel`

Ngay trước khi Dockview bắt đầu kéo panel:

- lưu `draggingPanelId`;
- tạo drag ghost tùy biến bằng DOM API;
- gọi `dataTransfer.setDragImage(...)`;
- đăng ký `dragend` và `pointerup` để dọn state nếu thao tác kết thúc ngoài đường drop bình thường.

Drag ghost chỉ sống đủ lâu để browser chụp ảnh kéo. Nó được remove ở `requestAnimationFrame` kế tiếp.

### Bước 3: `onWillShowOverlay`

Khi con trỏ đi qua một drop zone, Dockview báo:

- `overlayEvent.group?.id`: group đang được nhắm tới;
- `overlayEvent.position`: `left`, `right`, `top`, `bottom` hoặc `center`.

Code lưu hai giá trị này vào `target`.

### Bước 4: `PanelFrame` hiển thị trạng thái

Mọi widget được bọc bằng `PanelFrame`:

- panel đang kéo nhận class `is-drag-source`;
- panel thuộc group đích nhận class `is-active-target`;
- `DockTarget` chỉ render trong đúng group và đúng hướng hiện tại.

Hướng `center` hiển thị nhãn `Create tab group`; các hướng khác hiển thị `Dock left/right/top/bottom`.

### Bước 5: Dockview tự sửa cây layout

Khi người dùng thả:

- Dockview di chuyển panel hoặc tạo split/tab group;
- FinOps không tự tính tọa độ hay tự sửa JSON;
- `onDidDrop` chỉ xóa `draggingPanelId` và `target` khỏi React state.

CSS ẩn drop overlay mặc định của Dockview:

```css
.finops-dockview .dv-drop-target-container,
.finops-dockview .dv-drop-target-dropzone {
  opacity: 0 !important;
}
```

Vì vậy phần người dùng nhìn thấy là `DockTarget` của FinOps, nhưng hit testing và phép biến đổi layout vẫn do Dockview xử lý.

## 10. Header tab tùy biến

`defaultTabComponent={DashboardTab}` thay header mặc định của mọi panel bằng header FinOps.

Mỗi header gồm:

- grip kéo panel;
- title;
- Minimize;
- Maximize/Restore;
- More options.

Nút `More options` hiện chỉ có giao diện và `aria-label`; chưa có handler nên bấm vào chưa làm gì.

### Maximize

```ts
if (api.isMaximized()) api.exitMaximized();
else api.maximize();
```

API được lấy từ panel nhưng tác dụng hiển thị là phóng to group chứa panel trong workspace Dockview. Sidebar và Topbar không biến mất vì chúng nằm ngoài `finops-dock-workspace`.

## 11. Minimize và Add Widget

Dockview không được dùng như nơi lưu danh sách panel đã minimize. FinOps quản lý phần này riêng.

### Minimize

```ts
const panel = api.getPanel(panelId);
if (panel) api.removePanel(panel);
setMinimizedPanelIds((current) =>
  current.includes(panelId) ? current : [...current, panelId]
);
```

Quy tắc:

1. Tìm panel trong Dockview.
2. Xóa panel khỏi layout đang active.
3. Thêm ID vào `minimizedPanelIds`.

Do panel đã bị remove, `api.toJSON()` không còn chứa panel đó. Vì thế phải lưu thêm `minimizedPanelIds` bên ngoài JSON Dockview.

### Restore qua Add Widget

```ts
api.addPanel({
  id: panelId,
  component: meta.component,
  title: meta.title,
  position: { direction: "right" },
});
```

Panel được thêm lại ở cạnh phải của toàn grid, rồi ID bị xóa khỏi `minimizedPanelIds`.

Điểm cần nhớ: minimize/restore chỉ đổi state client. Muốn giữ qua lần reload, người dùng vẫn phải vào Customize layout và bấm Save layout.

## 12. Reset, Cancel và Save khác nhau ra sao?

| Action | Thay đổi Dockview hiện tại | Thay đổi database | Kết quả |
| --- | --- | --- | --- |
| Reset | Có | Chưa | Dựng layout mặc định và báo “Save to keep it” |
| Cancel | Có | Không | Quay về snapshot `beforeEdit` |
| Escape | Có | Không | Giống Cancel |
| Save layout | Không dựng lại | Có | Serialize trạng thái hiện tại và lưu theo user |

Reset không xóa preference trong database. Nếu bấm Reset rồi Save, database sẽ chứa JSON của layout mặc định mới được dựng.

## 13. Layout được serialize và lưu như thế nào?

### Payload của ứng dụng

FinOps bọc JSON Dockview trong một envelope:

```ts
{
  version: 1,
  dockview: api.toJSON(),
  minimizedPanelIds,
}
```

Ý nghĩa:

- `version`: phiên bản contract do FinOps kiểm soát;
- `dockview`: cây layout do thư viện Dockview kiểm soát;
- `minimizedPanelIds`: state do FinOps kiểm soát.

### Bên trong `dockview`

`SerializedDockview` của phiên bản hiện tại có các phần chính:

```text
dockview
├─ grid
│  ├─ root          cây branch/leaf của các group
│  ├─ width/height  kích thước lúc serialize
│  └─ orientation   hướng gốc của grid
├─ panels           map panel ID → component/title/params
├─ activeGroup      group đang active
└─ floatingGroups / popoutGroups / edgeGroups (tùy chọn)
```

Trong FinOps, `disableFloatingGroups` đang bật nên người dùng không tạo floating group bằng UI.

Không nên tự sửa thủ công cấu trúc `dockview`. Hãy coi nó là dữ liệu opaque của thư viện và chỉ đi qua `toJSON()/fromJSON()`.

### Luồng lưu xuống server

```text
saveLayout()
  │
  ├─ api.toJSON()
  ├─ ghép minimizedPanelIds
  ▼
saveDashboardLayoutAction(layout)
  │
  ├─ đọc lại session phía server
  ├─ gọi updateDashboardLayout(user.id, layout)
  ▼
updateDashboardLayout()
  │
  ├─ validate user active
  ├─ validate Zod dashboardLayoutSchema
  ├─ transaction
  ├─ upsert user_settings.preferences.dashboardLayout
  └─ ghi audit log DASHBOARD_LAYOUT_UPDATE
```

Nếu thành công, Server Action gọi `revalidatePath("/dashboard")`. Client chuyển `editing` về `false` và hiện `Layout saved`. Nếu thất bại, client giữ edit mode và hiển thị lỗi.

### Vị trí trong database

Layout không có bảng riêng. Nó nằm trong:

```text
finops.user_settings
└─ preferences (JSONB)
   └─ dashboardLayout
      ├─ version
      ├─ dockview
      └─ minimizedPanelIds
```

Khi lưu, code merge `dashboardLayout` vào `preferences` hiện có nên các preference khác không bị mất.

Layout là preference cá nhân: khóa bản ghi là `user_id`, và mọi role active đều có thể lưu layout của chính mình.

## 14. Luồng khôi phục khi mở lại trang

```text
getDashboardLayout(user.id)
  │
  ├─ findUserSettings(...)
  ├─ lấy preferences.dashboardLayout
  └─ parseDashboardLayout(...)
        │
        ├─ sai schema → null
        └─ hợp lệ → DashboardLayout
                         │
                         ▼
DashboardDockLayout initialLayout
                         │
                         ▼
onReady → api.fromJSON(initialLayout.dockview)
```

Có hai tầng fallback:

1. Envelope sai schema: server trả `null`, client dựng default.
2. Envelope hợp lệ nhưng JSON bên trong làm `fromJSON()` throw: client bắt lỗi và dựng default.

Schema hiện chỉ xác minh `dockview` là object record, chưa validate sâu đúng cấu trúc nội bộ của Dockview. Việc kiểm tra sâu được để cho `fromJSON()`.

## 15. Styling Dockview

`app/globals.css` import theo thứ tự:

```css
@import "tailwindcss";
@import "dockview-react/dist/styles/dockview.css";
@import "../tokens.css";
@import "../components/dashboard/dashboard-dockview.css";
```

CSS gốc cung cấp cấu trúc cần thiết của Dockview. CSS FinOps nạp sau để đổi theme và chi tiết hiển thị.

### CSS variables của Dockview

`.finops-dockview` map theme Dockview sang design token FinOps, ví dụ:

- background group;
- background/tab color;
- chiều cao header `44px`;
- màu sash thường và active;
- màu drag-over.

### Các class trạng thái quan trọng

| Class | Khi nào có | Hiệu ứng |
| --- | --- | --- |
| `.is-editing` | `editing === true` | Cho phép splitter, hiện trợ giúp edit |
| `.is-drag-source` | Panel đang bị kéo | Viền dashed và opacity `0.42` |
| `.is-active-target` | Group đang là drop target | Viền xanh info |
| `.finops-dock-target--right` | Hướng thả là right | Preview nằm bên phải group |

## 16. Vì sao Dockview có đúng chiều cao?

Dockview cần một chuỗi parent có chiều cao hữu dụng; nếu một parent không có height/flex đúng, workspace có thể cao `0px`.

Chuỗi hiện tại:

```text
AppShell: fixed inset-0
└─ content column: flex + min-h-0
   └─ scroll area: flex-1 + min-h-0
      └─ desktop wrapper: h-full + min-h-0
         └─ finops-dock-dashboard: height 100% + flex column
            └─ finops-dock-workspace: flex 1 + min-height 0
               └─ finops-dockview: height 100% + width 100%
```

`min-h-0` rất quan trọng trong flex layout: nó cho phép phần tử con co lại thay vì ép container tràn chiều cao.

## 17. Ý nghĩa các prop trên `DockviewReact`

```tsx
<DockviewReact
  className="dockview-theme-dark finops-dockview"
  components={components}
  defaultTabComponent={DashboardTab}
  onReady={onReady}
  keyboardNavigation
  disableFloatingGroups
  singleTabMode="fullwidth"
  tabGroupAccent="off"
/>
```

| Prop | Ý nghĩa |
| --- | --- |
| `components` | Registry renderer nội dung panel |
| `defaultTabComponent` | Header/tab tùy biến cho mọi panel |
| `onReady` | Nơi nhận API, restore/default layout và đăng ký event |
| `keyboardNavigation` | Bật điều hướng bàn phím do Dockview cung cấp |
| `disableFloatingGroups` | Không cho kéo panel thành cửa sổ nổi trong workspace |
| `singleTabMode="fullwidth"` | Khi group chỉ có một tab, tab chiếm toàn chiều rộng header |
| `tabGroupAccent="off"` | Tắt màu accent group mặc định của Dockview |

## 18. Dữ liệu nào là thật, dữ liệu nào là demo?

Theo code hiện tại:

- account, buying power, cash balance, positions và orders được đọc từ PostgreSQL;
- portfolio metrics được tính ở server từ snapshot đó;
- giá position dùng `instrument.referencePrice` trong database;
- watchlist lấy từ `lib/market-data.ts`;
- Equity curve lấy mảng chiều cao cố định từ `lib/mock-data.ts`;
- ngày `15 July 2026` đang hardcode trong UI;
- dòng “prices update every 500 ms” và “500 ms feed” hiện là nhãn giao diện; component Dashboard không có timer/subscription cập nhật mỗi 500 ms.

Nói cách khác, Dockview không liên quan đến realtime feed. Nếu sau này có realtime state, dữ liệu mới vẫn nên đi qua data/store/context; layout JSON chỉ nên giữ bố cục.

## 19. Những chi tiết hiện tại dễ gây hiểu nhầm

### Không có auto-save

Code không nghe `onDidLayoutChange` để tự lưu. Kéo, resize, minimize, restore và reset chỉ tồn tại ở client cho đến khi bấm Save layout.

### Cancel quay về lúc bắt đầu edit, không nhất thiết là database

Nếu người dùng minimize một widget trước khi bấm Customize, snapshot `beforeEdit` đã bao gồm thay đổi đó. Cancel sẽ quay về snapshot này, không quay về layout lưu trong database.

### Minimize hoạt động cả ngoài edit mode

Nút minimize luôn được render và không kiểm tra `editing`. Thao tác này không tự lưu.

### Mobile bị ẩn bằng CSS, không phải render có điều kiện

Dockview nằm trong `hidden lg:block`. Điều này đảm bảo không nhìn thấy trên mobile, nhưng không đảm bảo JavaScript Dockview hoàn toàn không khởi tạo trên mobile.

### Event subscription không có cleanup tường minh trong component

`onWillDragPanel`, `onWillShowOverlay` và `onDidDrop` trả về disposable nhưng code hiện không giữ chúng để gọi `dispose()` trong React cleanup. Component đang dựa vào vòng đời/dispose của Dockview khi unmount.

### Nút More options chưa hoạt động

Nút đã có accessibility label nhưng chưa có `onClick`.

### Fallback JSON hỏng có một trường hợp lệch state

Nếu envelope qua Zod nhưng `dockview` làm `fromJSON()` throw, code dựng lại đủ bốn default panel. Tuy nhiên `minimizedPanelIds` ban đầu vẫn có thể giữ danh sách cũ từ envelope. Đây là trường hợp dữ liệu hỏng/không tương thích hiếm gặp cần lưu ý khi thêm migration layout.

## 20. Muốn thêm một widget mới thì sửa ở đâu?

Ví dụ thêm `Recent orders`, tối thiểu cần đi theo checklist này:

1. Mở rộng `DashboardDockData` nếu widget cần data mới.
2. Chuẩn bị data trong `app/dashboard/page.tsx`.
3. Thêm ID/component/title vào `PANEL_META`.
4. Viết `RecentOrdersPanel` và bọc nội dung bằng `PanelFrame`.
5. Thêm renderer vào `components` registry.
6. Thêm panel vào `addDefaultPanels()` nếu muốn nó xuất hiện mặc định.
7. Quyết định mobile có cần nội dung tương ứng hay không; mobile không dùng registry Dockview.
8. Nếu đổi ý nghĩa layout đã lưu, tăng version và thêm migration/fallback phù hợp.

Không cần tạo một store riêng chỉ để Dockview biết dữ liệu widget. Context hiện tại đã giải quyết việc đó.

## 21. Cách debug nhanh

### Dockview trắng hoặc cao 0px

Kiểm tra từ `.finops-dockview` ngược lên `AppShell` xem parent nào mất `height`, `flex-1` hoặc `min-h-0`.

### Layout không khôi phục

Kiểm tra theo thứ tự:

1. `getDashboardLayout()` có trả `null` không;
2. `preferences.dashboardLayout.version` có bằng `1` không;
3. `dockview` có phải object không;
4. `fromJSON()` có throw và rơi vào `catch` không;
5. các `component` trong JSON có còn tồn tại trong registry `components` không.

### Minimize rồi reload thấy widget quay lại

Đây là hành vi hiện tại nếu chưa bấm Save layout. `minimizedPanelIds` mới chỉ ở React state.

### Kéo không được

Kiểm tra:

- đã bấm Customize layout chưa;
- `editing` có là `true` không;
- `api.updateOptions({ locked: false })` đã chạy chưa;
- pointer có bắt đầu từ `[data-dock-grip]` không.

### Drop target đúng nhưng giao diện không đổi

`DockTarget` chỉ là preview. Phép di chuyển thật do Dockview thực hiện. Kiểm tra event drop của thư viện và đừng tự sửa `target` để giả lập layout.

## 22. Tóm tắt mô hình tư duy

Hãy coi Dashboard là ba lớp:

```text
DATA
Server Component + services + database
Tính và format dữ liệu tài chính
        │
        ▼
CONTENT
AccountOverviewPanel / EquityCurvePanel / WatchlistPanel / TopHoldingsPanel
Render nội dung widget từ React Context
        │
        ▼
LAYOUT
Dockview grid/group/panel/tab + toJSON/fromJSON
Quản lý vị trí, kích thước, tab, maximize và drag/drop
```

Nếu thay đổi **con số hoặc nội dung widget**, hãy tìm ở lớp DATA/CONTENT. Nếu thay đổi **vị trí, resize, drag, tab hoặc lưu bố cục**, hãy tìm ở lớp LAYOUT.
