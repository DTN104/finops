# FinOps database schema

## Tổng quan

Persistence layer dùng PostgreSQL, Drizzle ORM và Drizzle Kit. Tất cả object ứng dụng nằm trong PostgreSQL schema `finops`; market ticks không được ghi vào PostgreSQL.

- Kết nối: `src/db/index.ts`
- Kiểm tra biến môi trường bằng Zod: `src/db/env.ts`
- Drizzle config: `drizzle.config.ts`
- Domain schemas: `src/db/schema/*.ts`
- Initial migration: `drizzle/0000_initial.sql`
- Deterministic seed: `src/db/seed.ts`

Giá tiền được lưu bằng `bigint` theo đơn vị VND nguyên. Số lượng cổ phiếu dùng `integer`. Thời điểm nghiệp vụ dùng `timestamp with time zone`; ngày corporate action dùng `date`.

## Domains và tables

| Domain | Table | Primary key | Nội dung chính |
| --- | --- | --- | --- |
| Users and roles | `roles` | `code` | Ba role `viewer`, `trader`, `admin` |
| Users and roles | `users` | `id` UUID | Identity, email duy nhất, role và trạng thái |
| Trading accounts | `trading_accounts` | `id` UUID | Cash balance, buying power, realized P&L |
| Instruments | `instruments` | `symbol` | Metadata và reference/previous-close price; không chứa ticks |
| Orders | `orders` | `id` UUID | Public ID, side, type, status, quantity, fill và reserve |
| Executions | `executions` | `id` UUID | Mỗi fill gắn với order, account và instrument |
| Positions | `positions` | `(account_id, instrument_symbol)` | Quantity, average cost và realized P&L |
| Cash ledger | `cash_ledger` | `id` UUID | Dòng tiền/reserve/release bất biến theo account |
| Corporate actions | `corporate_actions` | `id` UUID | Event, dates, cash/ratio, trạng thái publish |
| Corporate action responses | `corporate_action_responses` | `id` UUID | Một response cho mỗi action/account |
| Audit | `audit_logs` | `id` UUID | Actor, action, outcome, before/after và metadata |
| User settings | `user_settings` | `user_id` | Theme, density, cadence và JSON preferences |

## Quan hệ

```text
roles 1 ── N users 1 ── N trading_accounts
                  │              ├── N orders 1 ── N executions
                  │              ├── N positions ── 1 instruments
                  │              ├── N cash_ledger
                  │              └── N corporate_action_responses
                  ├── 1 user_settings
                  └── N audit_logs

instruments 1 ── N orders / executions / positions / corporate_actions
corporate_actions 1 ── N corporate_action_responses
orders 1 ── N cash_ledger
executions 1 ── N cash_ledger
```

Foreign keys dùng `restrict` cho dữ liệu giao dịch để không xóa lịch sử ngoài ý muốn. `user_settings` dùng `cascade` khi user bị xóa. Audit actor/account dùng `set null` để giữ log.

## Indexes và constraints

Các index phục vụ access patterns hiện tại:

- Unique: user email, account number, order public ID, corporate action reference, response `(corporate_action_id, account_id)`.
- Orders: account/time, status/time và instrument/time.
- Executions: order/time và account/time.
- Positions: instrument.
- Cash ledger: account/time và order.
- Corporate actions: status/ex-date và instrument/record-date.
- Audit: created time, actor/time, resource/time và action/outcome.
- Users/instruments: role/status, exchange/status và sector.

Database checks bảo vệ quantity/price dương, fill không vượt order quantity, balance và reserve không âm, corporate action dates đúng thứ tự và tax basis points nằm trong `0..10000`.

## Transaction boundaries

Các service sau chạy toàn bộ nghiệp vụ và audit trong cùng Drizzle transaction:

| Mutation | Rows được khóa/cập nhật |
| --- | --- |
| Place order | Lock account; kiểm tra instrument/position; tạo order; reserve buying power; cash ledger; audit |
| Fill order | Lock order/account/position; tạo execution; cập nhật order, position, account và cash ledger; audit |
| Cancel order | Lock order/account; release reserve; cập nhật order và ledger; audit |
| Publish corporate action | Lock action; cập nhật publish state/actor/time; audit |
| Change user role | Lock target user; kiểm tra Admin/role; cập nhật role; audit |

Các mutation bổ sung `saveCorporateAction` và `updateUserSettings` cũng dùng transaction và luôn tạo audit log. Business denial được ghi với outcome `denied`; thành công dùng `success`.

## Seed data

`npm run db:seed` xóa dữ liệu application trong schema `finops` theo thứ tự an toàn và tạo lại cùng một dataset:

- Demo Viewer: `demo.viewer@finops.local`
- Demo Trader: `demo.trader@finops.local`
- Demo Admin: `demo.admin@finops.local`
- Instruments: `FPT`, `VCB`, `HPG`, `MWG`, `SSI`, `VNM`
- Một paper account cho mỗi demo user, positions, sample orders/execution, ledger, corporate actions, response, settings và seed audit.

UUID, amounts và timestamps của seed đều cố định, nên chạy lại sẽ cho cùng trạng thái.

## Realtime boundary

PostgreSQL chỉ giữ instrument master/reference data. Dữ liệu market streaming và 5.000 Performance Lab rows vẫn nằm tại:

- `lib/market-data.ts`: deterministic mock market source.
- `components/market/market-store.ts`: in-memory Zustand realtime client store.
- `components/performance/*`: Performance Lab state độc lập với trading persistence.

Không có table market ticks và không có mutation nào ghi từng tick vào PostgreSQL.

## Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:seed
```

Sao chép `.env.example` thành `.env` và điền PostgreSQL credentials trước khi chạy. `DATABASE_SCHEMA` phải là `finops`.
