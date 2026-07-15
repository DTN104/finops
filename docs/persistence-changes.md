# FinOps persistence implementation changes

## Đã thay đổi

- Thêm PostgreSQL connection pool và Drizzle client tại `src/db/index.ts`.
- Thêm Zod validation cho toàn bộ database environment variables tại `src/db/env.ts`.
- Tách schema thành các domain files dưới `src/db/schema` và khai báo relations, indexes, unique keys, foreign keys cùng database checks.
- Thêm `drizzle.config.ts`, initial migration và metadata của Drizzle Kit.
- Thêm deterministic seed cho ba demo roles/users, ba paper accounts, sáu instruments, positions, orders, execution, ledger, corporate actions, response, settings và audit.
- Thêm repository layer dưới `src/repositories`.
- Thêm query/mutation services dưới `src/services`.
- Dùng Drizzle transaction cho place/fill/cancel order, publish corporate action và change user role.
- Mọi service mutation ghi success/denied audit log trong transaction.
- Session cookie giờ lưu UUID của user trong DB thay vì chỉ lưu role giả lập.
- Thêm Server Actions cho trading, corporate actions, role management và settings.
- Dashboard portfolio metrics, portfolio, position detail, stock order flow, orders, corporate actions, users, settings và audit logs giờ đọc từ PostgreSQL qua Server Components.
- Xóa ba Zustand/localStorage mock persistence stores cũ của trading, operations và audit.
- Chuyển market streaming state sang in-memory Zustand store riêng; không liên kết với PostgreSQL.
- Giữ nguyên deterministic market data và Performance Lab client state; không lưu market ticks.
- Thêm các scripts `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`.
- Thêm `.env.example` và cập nhật test suite cho service validation.

## Không thay đổi

- Không thêm product screen mới và không thay đổi layout/design system.
- Không tạo REST endpoints cho business mutations.
- Không dùng Route Handlers cho order, corporate action, role hoặc settings mutations.
- Equity chart fixture và market quote generator vẫn là deterministic demo data; chúng không phải persistence source cho trading state.

## Đã xác minh

- TypeScript strict typecheck.
- Drizzle initial migration generation.
- Migration được áp vào PostgreSQL local với đủ 12 domain tables.
- Deterministic seed chạy thành công và có thể chạy lặp lại.
- Integration smoke test trên PostgreSQL cho place, fill, cancel, publish và role change; 8 audit records được tạo cho 8 mutations.
- DB được seed lại sau smoke test để trả về trạng thái demo chuẩn.
