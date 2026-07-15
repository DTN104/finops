# Flow 4 — Corporate Actions và Admin

> Tài liệu tracking triển khai  
> Cập nhật: 15/07/2026  
> Trạng thái: Hoàn tất phạm vi Flow 4

## 1. Phạm vi đã triển khai

- [x] Corporate Actions List
- [x] Corporate Action Detail
- [x] Corporate Action Create/Edit Form
- [x] Review and Publish
- [x] Audit Logs
- [x] Audit Detail Drawer
- [x] User Management
- [x] Edit Role
- [x] Settings
- [x] RBAC cho Viewer, Trader và Admin
- [x] Audit log cho create, update, publish, role change và order actions

## 2. Routes

| Route | Chức năng | Viewer | Trader | Admin |
| --- | --- | :---: | :---: | :---: |
| `/corporate-actions` | Danh sách corporate actions | Read-only | Read-only | Quản lý |
| `/corporate-actions/new` | Tạo corporate action | Chặn | Chặn | Cho phép |
| `/corporate-actions/[id]` | Xem chi tiết | Published only | Published only | Tất cả |
| `/corporate-actions/[id]/edit` | Chỉnh sửa corporate action | Chặn | Chặn | Cho phép |
| `/admin/audit-logs` | Danh sách và chi tiết audit | Chặn | Chặn | Cho phép |
| `/admin/users` | Quản lý user và role | Chặn | Chặn | Cho phép |
| `/admin/settings` | Workspace settings | Chặn | Chặn | Cho phép |

Các Admin route sẽ redirect người không có quyền về `/dashboard`. Draft hoặc corporate action chưa publish không hiển thị cho Viewer và Trader.

## 3. RBAC

| Khả năng | Viewer | Trader | Admin |
| --- | :---: | :---: | :---: |
| Xem market và corporate actions đã publish | Có | Có | Có |
| Xem portfolio | Read-only | Có | Có |
| Tạo và quản lý order | Không | Có | Có |
| Tạo, sửa, publish corporate action | Không | Không | Có |
| Xem audit logs | Không | Không | Có |
| Đổi role user | Không | Không | Có |
| Cập nhật settings | Không | Không | Có |

RBAC được áp dụng ở cả route guard phía server và capability gate trên giao diện.

## 4. Audit coverage

| Thao tác | Audit action | Outcome |
| --- | --- | --- |
| Tạo corporate action | `CA_CREATE` | `SUCCESS` |
| Cập nhật corporate action | `CA_UPDATE` | `SUCCESS` |
| Publish corporate action | `CA_PUBLISH` | `SUCCESS` |
| Thay đổi role | `USER_ROLE_UPDATE` | `SUCCESS` |
| Lưu workspace settings | `SETTINGS_UPDATE` | `SUCCESS` |
| Tạo order | `ORDER_CREATE` | `SUCCESS` hoặc `DENIED` |
| Fill order | `ORDER_FILL` | `SUCCESS` hoặc `DENIED` |
| Cancel order | `ORDER_CANCEL` | `SUCCESS` hoặc `DENIED` |

Mỗi bản ghi audit có các thông tin chính:

- ID và timestamp xác định.
- Actor, module, resource và origin/session.
- Outcome và mô tả hành động.
- Before/after khi thao tác có thay đổi dữ liệu.
- Integrity fingerprint hiển thị trong Audit Detail Drawer.

Audit logs được ghi vào PostgreSQL trong cùng transaction với business mutation. Giao diện chỉ đọc log qua Server Component.

## 5. Thay đổi kỹ thuật

### Corporate Actions và Admin

- `src/services/operations.service.ts`
  - Zod validation, RBAC và Drizzle transactions cho corporate actions, users và settings.
  - Tạo audit log khi create, update, publish, đổi role và lưu settings.
- `src/repositories/*`
  - PostgreSQL access cho corporate actions, users, settings và audit logs.
- `components/operations/corporate-actions-screen.tsx`
  - List, detail, create/edit form và review/publish flow.
- `components/operations/admin-screens.tsx`
  - Audit Logs, Audit Detail Drawer, User Management, Edit Role và Settings.
- `app/actions/operations.ts`
  - Server Actions cho create/update/publish corporate action, đổi role và settings.

### Shared UI và shell

- `components/ui/drawer.tsx`
  - Drawer có focus trap, đóng bằng Escape và trả focus về trigger.
- `components/ui/index.ts`
  - Export shared Drawer.
- `components/shell/app-shell.tsx`
- `components/shell/sidebar.tsx`
- `components/shell/topbar.tsx`
  - Bổ sung khu vực Corporate Actions và Administration.
- `components/login/login-form.tsx`
  - Bổ sung lựa chọn đăng nhập demo với role Admin.

### RBAC và audit order

- `lib/session.ts`
  - Session cookie trỏ tới user UUID trong PostgreSQL và quyền quản trị chỉ dành cho Admin.
- `src/services/trading.service.ts`
  - Ghi audit cho create, fill và cancel order, gồm cả success và denied.

### Tests

- `src/services/validation.test.ts`
  - Kiểm tra Zod validation cho orders, corporate action dates và settings.
- PostgreSQL integration smoke test
  - Kiểm tra place/fill/cancel, publish và role change cùng audit records.
- `lib/session.test.ts`
  - Kiểm tra chỉ Admin có quyền quản lý operations.

## 6. Kiểm thử đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| `npm test` | Pass — 22/22 tests |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| So sánh giao diện desktop 1440px với Figma | Đã kiểm tra |
| So sánh giao diện mobile 390px với Figma | Đã kiểm tra |
| Viewer không thấy nút tạo corporate action | Đã kiểm tra |
| Viewer truy cập Admin route bị redirect | Đã kiểm tra |
| Admin truy cập Settings thành công | Đã kiểm tra |

Các frame Figma đã dùng để đối chiếu:

- Corporate Actions: `19:2`, `19:162`, `19:281`, `19:400`.
- Audit/Admin: `20:2`, `20:152`, `20:335`, `20:478`, `20:639`.

## 7. Giới hạn hiện tại

- Dữ liệu business, demo identities và audit đã được lưu trong PostgreSQL; market feed vẫn là deterministic mock.
- User creation và disable/enable user chưa nằm trong subflow đã triển khai; các nút tương ứng đang disabled.
- Integrity fingerprint trong Audit Detail là dữ liệu mô phỏng, chưa phải chữ ký hoặc kiểm chứng cryptographic.
- Các settings được lưu và audit nhưng table density/quote cadence chưa được nối vào toàn bộ module hiện có.
- Toàn bộ dữ liệu tài chính, user và audit là dữ liệu mô phỏng.

## 8. Cách kiểm tra nhanh

1. Tại trang login, chọn `Continue as Admin`.
2. Mở `/corporate-actions` để tạo, sửa và publish một event.
3. Mở `/admin/users` để đổi role của user.
4. Mở `/admin/settings` để thay đổi và lưu settings.
5. Mở `/admin/audit-logs` để kiểm tra các audit record mới và Audit Detail Drawer.
6. Đăng nhập bằng Viewer hoặc Trader để xác nhận các giới hạn RBAC.
