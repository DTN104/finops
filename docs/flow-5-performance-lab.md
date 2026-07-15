# Flow 5 — Performance Lab

> Tài liệu tracking triển khai  
> Cập nhật: 15/07/2026  
> Trạng thái: Hoàn tất phạm vi Flow 5

## 1. Phạm vi đã triển khai

- [x] Route `/performance-lab` có kiểm tra demo session phía server.
- [x] Tạo và hiển thị 5.000 market rows deterministic.
- [x] Optimized mode dùng TanStack Virtual để chỉ mount vùng dữ liệu đang xem.
- [x] Baseline mode mount toàn bộ 5.000 rows để so sánh.
- [x] Mô phỏng 100 price updates mỗi 50 ms bằng một batch state update.
- [x] Giữ nguyên object identity của 4.900 rows không đổi trong mỗi tick.
- [x] Dùng `React.memo` để row không đổi không render lại trong optimized mode.
- [x] Đo FPS gần đúng, React commit time, visible rows và render count.
- [x] Hiển thị update cadence, frame-budget history và trạng thái pipeline.
- [x] Filter theo symbol hoặc company với deferred search ở optimized mode.
- [x] Chuyển đổi trực tiếp giữa Optimized và Baseline.
- [x] Reset các chỉ số đo hiệu năng.
- [x] Tách state benchmark khỏi PostgreSQL trading persistence và Zustand market store.

## 2. Route và giao diện

| Route | Chức năng | Yêu cầu session |
| --- | --- | --- |
| `/performance-lab` | Benchmark bảng realtime 5.000 rows | Có |

Route dùng `AppShell` hiện có và bổ sung trạng thái `performance-lab` cho shell:

- Sidebar hiển thị nhóm `ENGINEERING` và active item `Performance Lab`.
- Khu vực cuối sidebar hiển thị trạng thái lab thay cho user card.
- Topbar hiển thị `Performance Lab`, `Realtime rendering benchmark` và `LIVE BENCHMARK`.
- Giao diện desktop được đối chiếu với frame Figma 1440 × 1024.
- Dưới breakpoint `lg`, nội dung co giãn và table cho phép cuộn ngang; Figma không cung cấp mobile frame riêng cho Performance Lab.

## 3. Hai chế độ benchmark

| Đặc điểm | Optimized | Baseline |
| --- | --- | --- |
| Số row được mount | Vùng đang xem và overscan, khoảng 22 rows | Toàn bộ 5.000 rows |
| Virtualization | TanStack Virtual | Không |
| Row component | `React.memo` | Render thông thường |
| Stable row key | Symbol | Symbol |
| Update data | Một batch mỗi tick | Một batch mỗi tick |
| Mục đích | Luồng sử dụng tối ưu | Tạo mốc so sánh khi render toàn bộ dataset |

Optimized table khởi tạo tại vùng row khoảng `1842`, tương ứng với frame Figma. Table dùng chiều cao row cố định 38 px, overscan 4 và giữ nguyên symbol làm key.

## 4. Dữ liệu và update pipeline

Nguồn dữ liệu được lấy từ `marketInstruments` hiện có trong `lib/market-data.ts`. Dataset này có đúng 5.000 instruments deterministic và không chứa dữ liệu tài chính thật.

Mỗi tick thực hiện:

1. Chọn deterministic 100 row index bằng `tick`, bước `97` và bước offset `47`.
2. Clone mảng rows một lần.
3. Chỉ tạo object mới cho đúng 100 rows được cập nhật.
4. Tính lại `last`, `changePercent`, `volume` và tăng `updateCount`.
5. Gửi toàn bộ thay đổi qua một lần `setRows`.

Giá cập nhật dao động quanh seeded price (`baseLast`) thay vì cộng dồn vô hạn. Vì 4.900 row objects còn lại giữ nguyên reference, `React.memo` có thể bỏ qua chúng trong optimized mode.

Benchmark state chỉ nằm trong client component của Performance Lab. Route không import hoặc ghi vào PostgreSQL trading services hay `components/market/market-store.ts`, vì vậy mô phỏng 50 ms không ảnh hưởng market cadence 500 ms hoặc portfolio/order state của ứng dụng.

## 5. Performance measurements

| Chỉ số | Cách đo |
| --- | --- |
| Approx. FPS | Đếm `requestAnimationFrame` trong cửa sổ 500 ms, giới hạn theo mô phỏng 60 Hz |
| React commit | `actualDuration` mới nhất từ `React.Profiler` |
| Visible rows | Số virtual items đang mount; baseline hiển thị 5.000 |
| Render count | Số lần row component render kể từ lần reset gần nhất |
| Update cadence | 50 ms, tương đương 20 ticks/s |
| Frame budget | 16 mẫu React commit gần nhất so với budget 16,7 ms |

Kết quả quan sát trong lần kiểm tra Chrome headless 1440 × 1024:

| Mode | Approx. FPS | React commit | Visible rows |
| --- | ---: | ---: | ---: |
| Optimized | 60 FPS | khoảng 0,9–2,6 ms | 22 |
| Baseline | khoảng 6–8 FPS | khoảng 256–258 ms | 5.000 |

Các số đo phụ thuộc browser, CPU, development/production build và tải hệ thống; đây là telemetry cục bộ, không phải benchmark chuẩn hóa giữa các thiết bị.

## 6. Thay đổi kỹ thuật

### Performance Lab

- `app/performance-lab/page.tsx`
  - Server Component kiểm tra session và render Performance Lab trong `AppShell`.
- `components/performance/performance-lab.tsx`
  - Optimized/baseline tables, controls, telemetry, React Profiler và frame-budget panel.
- `lib/performance-lab.ts`
  - Kiểu dữ liệu benchmark, constants, khởi tạo 5.000 rows và batch update deterministic.
- `lib/performance-lab.test.ts`
  - Kiểm tra row count, tính deterministic và object identity của rows không đổi.

### Shared shell

- `components/shell/app-shell.tsx`
  - Bổ sung `performance-lab` vào `WorkspaceSection`.
- `components/shell/sidebar.tsx`
  - Bổ sung navigation và trạng thái Engineering Lab.
- `components/shell/topbar.tsx`
  - Bổ sung topbar riêng cho Performance Lab.

### Dependencies và scripts

- `package.json`
  - Bổ sung `@tanstack/react-virtual` phiên bản `^3.14.6`.
  - Bổ sung test Performance Lab vào `npm test`.
- `pnpm-lock.yaml`
  - Cập nhật lockfile cho TanStack Virtual.

## 7. Accessibility

- Table dùng các role `table`, `rowgroup`, `row`, `columnheader` và `cell`.
- Scroll container có thể focus bằng bàn phím và có focus ring.
- Profit/loss có nội dung screen-reader `Gain`, `Loss` hoặc `Unchanged`, không chỉ dựa vào màu.
- Trạng thái mode được công bố bằng vùng `aria-live`.
- Search input có accessible label.
- Các button dùng shared `Button` và giữ focus style của design system.

## 8. Kiểm thử đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| `npm test` | Pass — 22/22 tests |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| `git diff --check` | Pass |
| Optimized mode tại 1440 × 1024 | Đã kiểm tra bằng Chrome headless |
| Baseline mode tại 1440 × 1024 | Đã kiểm tra bằng Chrome headless |
| So sánh với Figma | Đã kiểm tra |

Các frame Figma đã dùng để đối chiếu:

- Foundations: `1:2`.
- Components: `1:3`.
- Performance Lab / Optimized: `21:2`.
- Performance Lab / Baseline: `21:324`.

## 9. Giới hạn hiện tại

- Đây là benchmark mô phỏng cục bộ; không có websocket hoặc market provider thật.
- FPS và commit time thay đổi theo thiết bị và môi trường chạy.
- Baseline mode cố ý tốn tài nguyên vì mount và render 5.000 rows.
- Figma chỉ định Performance Lab desktop 1440 px, không có composition mobile 390 px riêng.
- Search chỉ lọc dữ liệu trong bộ nhớ; không gọi API.
- Toàn bộ dữ liệu tài chính đều là dữ liệu mô phỏng deterministic.

## 10. Cách kiểm tra nhanh

1. Đăng nhập bằng bất kỳ demo role nào.
2. Mở `/performance-lab` từ sidebar.
3. Quan sát `Visible rows` ở optimized mode, thường khoảng 22 thay vì 5.000.
4. Cuộn table và xác nhận giao diện vẫn phản hồi trong khi dữ liệu cập nhật mỗi 50 ms.
5. Chọn `Compare baseline` và quan sát FPS, commit time, visible rows và render count.
6. Chọn `Return optimized` để quay lại virtualization.
7. Chọn `Reset metrics` để bắt đầu lại các số đo.
