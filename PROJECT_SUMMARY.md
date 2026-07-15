# FinOps Portfolio — Detailed Project Summary

> Last updated: 2026-07-15  
> Repository version: `0.1.0`  
> Status: Three working vertical slices are implemented; the broader Figma product remains partially planned.

## 1. Executive summary

FinOps is a responsive professional paper-trading portfolio application. It demonstrates a realistic financial workspace without connecting to real brokerage infrastructure, real funds, real securities, or internal company data.

The current application supports three end-to-end vertical slices:

1. `Landing → Login → Demo user → Dashboard`
2. `Dashboard → Market → FPT stock detail → Buy or Sell → Confirm → Success`
3. `Portfolio Overview → Position Detail` and `Orders → Cancel → Confirmation`

The implementation is built with the Next.js App Router, strict TypeScript, Tailwind CSS, Server Components by default, PostgreSQL with Drizzle ORM, an HTTP-only demo session, Zustand for in-memory market streaming state, Zod validation, and TanStack Table for the market experience.

All market quotes, portfolio balances, identities, positions, orders, timestamps, charts, and calculations are deterministic mock data. The application must never be presented as a live brokerage or source of financial advice.

## 2. Product vision

The complete FinOps concept is designed to demonstrate:

- A polished marketing and authentication experience.
- Professional portfolio and trading workflows.
- Realtime-style financial interfaces.
- Large table rendering and performance engineering.
- Role-based access control for Viewer, Trader, and Admin users.
- Auditable operational workflows.
- Responsive desktop and mobile product design.
- Clear frontend architecture and reusable component design.

The broader product scope documented in Figma includes:

- Landing and authentication.
- Dashboard.
- Realtime market table.
- Stock detail.
- Buy and sell order flows.
- Portfolio and order history.
- Corporate actions.
- Audit logs.
- User management.
- Settings.
- Performance Lab with 5,000 rows.
- Viewer, Trader, and Admin permissions.
- Desktop and mobile experiences.

Landing/authentication/dashboard, market/FPT trading, portfolio/position detail, and order history/cancellation are implemented. See [Current limitations and remaining scope](#17-current-limitations-and-remaining-scope) for the exact boundary.

## 3. Design source of truth

The visual source of truth is the FinOps Figma file:

- Figma: <https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W>
- File key: `m9MmphEJzKBmIiKrLSuR0W`

Important authored targets:

| Target | Validation size |
| --- | ---: |
| Desktop application | 1440 × 1024 |
| Mobile application | 390 × 844 |

The implementation uses one primary responsive switch at Tailwind's `lg` breakpoint (`1024px`):

- Below `1024px`: mobile composition.
- At or above `1024px`: desktop composition.
- No separate tablet design has been invented because Figma does not define one.

The implemented screens were visually compared against the corresponding Figma desktop and mobile frames. This includes Portfolio Overview, FPT Position Detail, Orders, the Cancel Order dialog, trading overlays, and mobile sheets.

Supporting design documentation is stored in `docs/`:

- `docs/figma-handoff.md`: variables, foundations, authored frame facts, and open design questions.
- `docs/component-map.md`: Figma components, recurring patterns, and product-state inventory.
- `docs/route-map.md`: intended screen hierarchy, prototype reactions, and RBAC matrix.
- `docs/decision-register.md`: recommended architectural decisions and identified gaps.
- `docs/implementation-plan.md`: phased implementation guidance.

Some documents were written before the current vertical slices were implemented. When a planning document and the running code differ, this summary identifies the current behavior explicitly.

## 4. Technology stack

### Runtime and framework

| Technology | Version/range | Responsibility |
| --- | --- | --- |
| Next.js | `16.2.10` | App Router, Server Components, routing, server actions, production build |
| React | `19.2.4` | UI rendering and client interaction state |
| TypeScript | `^5` | Strict static typing |
| Tailwind CSS | `^4` | Responsive styling and design-token utilities |

### Application libraries

| Library | Version/range | Responsibility |
| --- | --- | --- |
| PostgreSQL / Drizzle ORM | `drizzle-orm ^0.45.2` | Server-side business persistence and transactions |
| Zustand | `^5.0.14` | In-memory client market streaming state |
| Zod | `^4.4.3` | Environment, service input, session-role and form validation |
| TanStack React Table | `^8.21.3` | Market sorting, filtering, row models, and pagination |
| Lucide React | `^1.24.0` | Mobile navigation and interface icons |
| `clsx` | `^2.1.1` | Conditional class composition |
| `tailwind-merge` | `^3.6.0` | Tailwind class conflict resolution |

### Tooling

| Tool | Responsibility |
| --- | --- |
| ESLint 9 + `eslint-config-next` | Code quality and React/Next.js lint rules |
| `tsc --noEmit` | Strict type checking |
| Node test runner + `tsx` | TypeScript unit and rendering tests |
| Webpack-backed Next commands | Development and production builds |

TanStack Virtual powers the Performance Lab optimized mode. Current financial charts are deterministic inline SVG, and the primary market screen uses TanStack Table pagination rather than virtualization. Recharts remains a future option for interactive charts.

## 5. Application routes

### Implemented routes

| Route | Rendering | Access | Purpose |
| --- | --- | --- | --- |
| `/` | Static Server Component | Public | Marketing landing page and product preview |
| `/login` | Static shell + client form | Public | Demo Trader or Viewer sign-in |
| `/dashboard` | Dynamic Server Component | Authenticated | Portfolio metrics, equity curve, watchlist, and holdings |
| `/market` | Dynamic Server Component + client table | Authenticated | Realtime-style 5,000-instrument market |
| `/market/[symbol]` | Dynamic Server Component + client trading flow | Authenticated | FPT stock detail and mock order entry |
| `/portfolio` | Dynamic Server Component + client portfolio | Authenticated | Calculated portfolio metrics, allocation, performance, and holdings |
| `/portfolio/[symbol]` | Dynamic Server Component + client position detail | Authenticated | FPT position metrics, tax lots, chart, and activity |
| `/orders` | Dynamic Server Component + client order manager | Authenticated | Filtered order history, detail, and cancellation |
| `/corporate-actions` and children | Dynamic Server Components + client forms | Authenticated; Admin mutates | Corporate action list, detail, create/edit and publish |
| `/admin/audit-logs` | Dynamic Server Component + client filters | Admin | Persisted audit trail |
| `/admin/users` | Dynamic Server Component + client dialog | Admin | User and role management |
| `/admin/settings` | Dynamic Server Component + client form | Admin | Persisted user settings |
| `/performance-lab` | Dynamic shell + isolated client benchmark | Authenticated | 5,000-row optimized/baseline benchmark |
| `/dev/components` | Static development route | Public in current code | Shared component preview/gallery |

`/market/[symbol]` currently accepts only `FPT`, case-insensitively. Any other symbol calls Next.js `notFound()`.

## 6. Implemented user journeys

### 6.1 Landing and authentication

The public landing page includes:

- FinOps brand and marketing navigation labels.
- A paper-trading disclaimer.
- Main product proposition.
- Demo Trader and architecture calls to action.
- A deterministic portfolio preview.
- Mock equity bars and watchlist data.
- Technology and product positioning in the footer.

The login page includes:

- Desktop split-screen layout.
- Mobile-auth composition.
- Prefilled demo email and password fields.
- Password show/hide interaction.
- “Continue as Demo Trader” action.
- “Continue as Viewer” action.

The email, password, remember-device, and forgot-password controls are presentation-only. Login uses the submitted demo role to resolve a seeded active user from PostgreSQL; it does not verify the displayed password.

### 6.2 Dashboard

The authenticated dashboard includes:

- Net portfolio value.
- Buying power.
- Day profit and loss.
- Open-order count on desktop.
- Deterministic 30-day equity visualization.
- Watchlist.
- Top holdings table on desktop.
- Links from the watchlist to Market and FPT detail.
- Responsive mobile metric and content composition.

Dashboard portfolio metrics, open-order count and holdings read from PostgreSQL. The 30-day equity visualization and watchlist quote source remain deterministic demo data.

### 6.3 Market

The market screen includes:

- 5,000 deterministic mock HOSE instruments.
- Ten authored featured symbols followed by generated mock instruments.
- Symbol/company search.
- Sector filtering.
- Sortable columns.
- “Top volume” shortcut sorting.
- Ten-row desktop pagination.
- Responsive mobile quote list.
- FPT row navigation by mouse and keyboard.
- “TRADING” status badges.
- A deterministic 500ms quote update cadence.

Realtime behavior is simulated in the browser. Every 500ms, one featured non-FPT instrument is updated using a repeatable sequence of price deltas. FPT stays stable so the trading flow and Figma comparisons remain deterministic.

### 6.4 FPT stock detail

The FPT detail view includes:

- Symbol, exchange, company, sector, quote, absolute change, and percent change.
- Static candlestick-style SVG chart with an upward mock trend.
- Desktop order book with ask, midpoint, and bid levels.
- Open, high, low, previous close, volume, and market-cap statistics.
- Current FPT position.
- Unrealized profit and loss.
- Buy and Sell actions.
- Viewer read-only messaging and disabled trade actions.

The desktop order book is intentionally hidden in the mobile composition to match the authored frame.

### 6.5 Buy flow

Current default buy order:

| Field | Value |
| --- | ---: |
| Symbol | FPT |
| Side | BUY |
| Type | LIMIT |
| Quantity | 1,000 shares |
| Limit price | ₫126,400 |
| Gross value | ₫126,400,000 |
| Fee | ₫189,600 |
| Estimated total | ₫126,589,600 |
| Starting buying power | ₫486,200,000 |
| Buying power after | ₫359,610,400 |

Flow states:

```text
FPT detail
  → Buy ticket drawer/bottom sheet
  → Order validation
  → Confirmation dialog
  → Shared portfolio submission
  → Success dialog
  → Portfolio or Market
```

An accepted paper buy order is stored as `OPEN` in PostgreSQL, appears in Orders, and reserves its estimated total from buying power. The fill transaction updates execution, cash, ledger and weighted-average position atomically.

### 6.6 Sell flow

Current default sell order:

| Field | Value |
| --- | ---: |
| Symbol | FPT |
| Side | SELL |
| Type | LIMIT |
| Quantity | 800 shares |
| Limit price | ₫126,300 |
| Gross proceeds | ₫101,040,000 |
| Fee | ₫151,560 |
| Net estimated proceeds | ₫100,888,440 |
| Average cost | ₫112,100 |
| Estimated realized P&L | +₫11,360,000 |
| Position after a fill | 1,600 shares |

An accepted sell order is stored as `OPEN` and appears immediately in Orders. A fill reduces the position, credits net proceeds, and records realized P&L.

### 6.7 Portfolio Overview and Position Detail

Portfolio Overview reads the account and positions from PostgreSQL and calculates:

- Net asset value from cash plus current market value.
- Market value and cost basis for every position.
- Unrealized and total P&L in currency and percentage terms.
- Allocation percentages by sector plus cash.
- Responsive holdings rows with profit/loss text semantics.

The FPT Position Detail route derives quantity, average cost, market value, daily P&L, unrealized P&L, allocation, filled tax lots, and recent order activity from the same persisted snapshot. Its deterministic performance chart adapts to desktop and mobile layouts.

### 6.8 Orders and Cancel Order

Orders provides All, Open, Filled, Cancelled, and Rejected views, plus desktop search, side, and order-type filters. Selecting an order shows its detail and the actions permitted for the active demo user.

Cancellation rules are enforced both in the UI and in the transactional trading service:

- Viewer cannot cancel orders.
- Trader can cancel an active order submitted by that trader.
- Admin can cancel any active mock order.
- `PENDING`, `OPEN`, and `PARTIAL` orders are cancellable.
- `FILLED`, `CANCELLED`, and `REJECTED` orders are terminal and cannot be cancelled.
- Cancelling a buy order restores only its unfilled reserved buying power, exactly once.
- The shared reusable Dialog presents the authored confirmation and success feedback.

## 7. Authentication and session model

### Demo identities

| Role | Name | Email | UI sign-in action |
| --- | --- | --- | --- |
| Viewer | Jordan Lee | `demo.viewer@finops.local` | Yes |
| Trader | Alex Morgan | `demo.trader@finops.local` | Yes |
| Admin | Sam Rivera | `demo.admin@finops.local` | No current button |

The session cookie is named `finops_demo_session`.

Cookie properties:

- HTTP-only.
- SameSite `lax`.
- Path `/`.
- Maximum age of 30 minutes.
- `secure` in production.

Protected page behavior:

1. The page Server Component calls `getDemoSession()`.
2. The server reads and parses the cookie with Zod.
3. A missing or invalid session redirects to `/login`.
4. The authenticated `DemoUser` is passed into `AppShell` and the relevant interactive client boundary.

The 30-minute value is cookie lifetime, not true idle-time tracking. The cookie stores a seeded user UUID and the Server Component resolves the active user/role from PostgreSQL. There is no refresh token, password verification, CSRF-specific token, or external identity provider.

The mobile user-avatar button submits a server action that deletes the cookie and redirects to `/login`. A desktop logout control is not currently implemented.

## 8. Role-based access control

### Intended full-product matrix

| Capability | Viewer | Trader | Admin |
| --- | :---: | :---: | :---: |
| View market and portfolio | Yes | Yes | Yes |
| Submit mock orders | No | Yes | Yes |
| Cancel own orders | No | Yes | Yes |
| Create corporate actions | No | No | Yes |
| Manage users and roles | No | No | Yes |
| View audit logs | No | No | Yes |
| Change system settings | No | No | Yes |

### Currently enforced permissions

The implemented trading and order-management slices enforce permission at both interaction and service boundaries:

1. UI/domain validation through `canPlaceOrders()`, `validateOrder()`, and `canCancelOrder()`.
2. Transactional services independently reject unauthorized submissions and cancellations and write denied audit logs.

Current behavior:

- Viewer can browse Dashboard, Market, FPT detail, Portfolio, Position Detail, and Orders.
- Viewer trade buttons are disabled and a read-only message is shown.
- Trader can submit mock buy and sell orders.
- Trader can cancel their own active orders, but not terminal or another user's orders.
- Admin is recognized by the session/domain model and can submit orders.
- Admin can cancel any active mock order.
- Admin-specific routes for corporate actions, audit, users and settings are implemented.

## 9. Trading validation and calculations

Order input is validated with the Zod schema in `lib/trading.ts`.

### Schema rules

- Symbol must be an uppercase instrument code that exists and is tradable in PostgreSQL.
- Side must be `buy` or `sell`.
- Order type must be `LIMIT`.
- Quantity must be a positive whole number.
- Quantity must use 100-share lots.
- Limit price must be a positive whole number.
- Limit price must use ₫100 ticks.
- Viewer users cannot place orders.
- Buy total including fees cannot exceed buying power.
- Sell quantity cannot exceed the available position after active sell reservations.

### Calculation formulas

```text
gross = quantity × limitPrice
fee = round(gross × 0.0015)

buyTotal = gross + fee
buyingPowerAfter = buyingPower - buyTotal

sellProceeds = gross - fee
positionRemaining = positionQuantity - quantity
realizedPnl = (limitPrice - averageCost) × quantity
```

The fee is a deterministic 0.15% simulation. It is not a statement of actual exchange, broker, or tax charges.

The order is revalidated inside a Drizzle transaction using locked account/position rows. This prevents a stale confirmation dialog or concurrent request from bypassing current buying-power or position checks.

## 10. PostgreSQL portfolio state

The persistence layer is defined under `src/db`, with domain repositories in `src/repositories` and business services in `src/services`.

### Initial deterministic state

`npm run db:seed` recreates three demo users/accounts, FPT/VCB/HPG/MWG/SSI/VNM instruments, positions, sample orders/execution, cash ledger, corporate actions, responses, settings and audit data with fixed UUIDs and timestamps.

### Persistence

- PostgreSQL schema: `finops`.
- Drizzle ORM is used for reads and writes; Drizzle Kit owns migrations.
- Server Components read account, portfolio, order and admin data.
- Server Actions call transactional services for business mutations.
- Place, fill, cancel, publish and role changes use database transactions and row locks.
- Every business mutation writes a success or denied audit log.
- No business state is stored in browser local storage.
- Market streaming and Performance Lab state remain in-memory client data and do not write ticks to PostgreSQL.

### Portfolio calculations

`lib/portfolio.ts` contains explicit, testable calculations for position market value, cost basis, unrealized P&L, daily P&L, portfolio NAV, total return, and allocation. No displayed portfolio percentage is hardcoded; changing or filling positions recomputes the result from shared state.

### Order lifecycle actions

- `placeOrder()` creates an open order and reserves buy-side buying power.
- `fillOrder()` supports partial and full fills and atomically updates execution, cash, positions, buying power, ledger and realized P&L.
- `cancelOrder()` checks role, ownership and active status, then restores an eligible buy reservation once.
- Every action guards against repeated transitions from a terminal state.

## 11. Deterministic mock data

### Dashboard fixtures

`lib/mock-data.ts` retains the deterministic equity-bar heights and landing-page previews. Authenticated dashboard account/portfolio data comes from PostgreSQL; watchlist quotes come from `lib/market-data.ts`.

### Market universe

`lib/market-data.ts` provides exactly 5,000 instruments:

- Ten featured instruments: FPT, VCB, HPG, MWG, SSI, VNM, GAS, TCB, VIC, and MSN.
- 4,990 generated instruments named `M0011` onward.
- Repeatable prices, previous closes, volumes, bid/ask values, sectors, and percent changes.
- All instruments currently use exchange `HOSE` and status `TRADING`.

### FPT order book

The deterministic six-level order book contains:

- Two ask levels.
- One midpoint/current-price level.
- Three bid levels.

No network connection, websocket, polling endpoint, or third-party market provider is used.

## 12. Rendering architecture

### Server Components by default

Page and layout components remain Server Components unless interaction or browser state is required.

Important server-rendered responsibilities:

- Root layout and font setup.
- Landing page.
- Login page shell.
- Dashboard route guard and dashboard composition.
- Market route guard and page shell.
- FPT route guard and symbol validation.
- Shared desktop/mobile shell components.
- Session cookie access.
- Login/logout server actions.

### Client Components

Client boundaries are used for:

- Login password visibility.
- Realtime market updates.
- Market sorting, filtering, pagination, and navigation behavior.
- Pagination controls.
- FPT order-flow state machine.
- Order ticket input state.
- Dialog focus management.
- In-memory Zustand market streaming state; business persistence stays server-side in PostgreSQL.

### Main runtime flow

```text
Browser request
  → Next.js Server Component route
  → HTTP-only session lookup
  → redirect if unauthenticated
  → server-rendered AppShell
  → interactive MarketTable or StockDetail client boundary
  → Zod/domain validation
  → Server Action and Drizzle transaction
  → PostgreSQL business state and audit log
  → confirmation/success UI
```

There are currently no Next.js Route Handlers under `app/api`. Mock data is imported directly into server/client modules.

## 13. Component architecture

### Shell components

| Component | Responsibility |
| --- | --- |
| `AppShell` | Responsive authenticated layout and scroll boundary |
| `Sidebar` | Desktop navigation, active section, and role identity |
| `Topbar` | Desktop global search placeholder, market status, quick trade |
| `MobileHeader` | Mobile status bar, brand, and logout action |
| `MobileBottomNav` | Mobile Dashboard and Market navigation plus future disabled sections |
| `Brand` | Reusable linked FinOps mark and wordmark |

Desktop shell geometry follows the authored 232px sidebar and 72px topbar.

### Shared UI components

| Component | Current capability |
| --- | --- |
| `Button` | Small/medium/large; primary/secondary/danger; default/hover/disabled |
| `ActionLink` | Link styled using shared action patterns |
| `FormField` | Text/search/select; default/focus/error/disabled |
| `StatusBadge` | Neutral/info/success/warning/danger; soft/solid |
| `MetricCard` | Neutral/positive/negative/warning trends |
| `DataTable` | Generic typed semantic table |
| `Pagination` | Previous/next, selected page, compact ellipsis |
| `Dialog` | Accessible overlay, focus trap, Escape behavior, focus restoration |
| `EmptyState` | Accessible reusable empty-state presentation |
| `ErrorState` | Accessible alert/error presentation |
| `LoadingSkeleton` | Line/page/table loading patterns |

### Trading components

| Component | Responsibility |
| --- | --- |
| `StockDetail` | FPT content and order-flow state machine |
| `CandlestickChart` | Deterministic responsive SVG price chart |
| `OrderBook` | Semantic desktop order-book table |
| `OrderTicket` | Reusable buy/sell drawer and mobile sheet |
| `OrderConfirmationDialog` | Shared buy/sell review state |
| `OrderSuccessDialog` | Shared buy/sell success state |
| `usePortfolioStore` | Persisted cash, buying power, positions, order lifecycle, and P&L |

### Portfolio and order components

| Component | Responsibility |
| --- | --- |
| `PortfolioOverview` | Calculated portfolio metrics, performance, allocation, and holdings |
| `AllocationList` | Reusable sector/cash allocation visualization |
| `PositionDetail` | FPT position metrics, chart, tax lots, and order activity |
| `PositionPerformanceChart` | Deterministic responsive position chart |
| `OrdersScreen` | Tabs, filters, responsive order list/table, selection, and actions |
| `CancelOrderDialog` | Reusable accessible cancel confirmation using the shared Dialog |

### Component preview

`/dev/components` renders the shared Figma-derived component variants for development review. It is not currently restricted to development builds.

## 14. Styling and design system

The design system is implemented in `app/globals.css` using CSS custom properties.

### Core visual rules

- Product UI font: Inter.
- Financial/data font: IBM Plex Mono.
- Brand accent: `#C9DD03`.
- Profit: green.
- Loss: red.
- Warning: amber.
- Information: blue.
- Default application theme: dark.
- Light and dark semantic token sets are defined.

### Token groups

- Navy, slate, white, black, accent, green, red, amber, and blue primitives.
- Spacing from 0px through 64px.
- Radius values from 0px through fully rounded.
- Typography sizes, weights, and line heights.
- Elevation shadows.
- Accent focus ring.
- Semantic background, text, border, status, and overlay tokens.

Repeated colors and effects are expressed through variables such as:

- `--finops-bg-canvas`
- `--finops-bg-surface`
- `--finops-text-primary`
- `--finops-border-default`
- `--finops-status-profit`
- `--finops-status-loss`
- `--finops-bg-brand`
- `--focus-accent`

## 15. Responsive behavior

### Desktop

- Fixed 232px sidebar.
- Fixed 72px topbar.
- Scrollable content region.
- Dense tables and complete order book.
- Right-side 470px trading drawer.
- Centered 540px confirmation/success dialogs.
- Full dashboard holdings table.
- Portfolio analytics, holdings table, and order detail panel.

### Mobile

- Compact status bar and 62px product header.
- 72px bottom navigation.
- Single-column content.
- Market quote cards/list instead of the desktop table.
- Order book hidden.
- Buy/sell actions fixed within normal content flow above bottom navigation.
- 390px-wide, 560px-high order bottom sheet at the authored viewport.
- Mobile-friendly paired quantity and price inputs.
- Authored Portfolio allocation/holdings cards and Orders card list.

The layout uses `h-dvh` and internal scrolling to avoid allowing the shell itself to exceed the device viewport.

## 16. Accessibility

Implemented accessibility behavior includes:

- Semantic headings, sections, navigation, forms, labels, tables, and captions.
- Keyboard-accessible links and buttons.
- Keyboard navigation on the FPT market row with Enter or Space.
- `aria-current` on active navigation and pagination.
- Dialog `role="dialog"`, `aria-modal`, and labelled titles.
- Focus entry, Tab/Shift+Tab trapping, Escape handling, and focus restoration.
- Visible focus styles using the brand focus token.
- `aria-invalid` for order fields with validation problems.
- `role="alert"` for order-validation errors.
- Screen-reader descriptions for gain, loss, and unchanged values.
- Profit/loss semantics conveyed in text, not only color.
- SVG chart roles and descriptive labels.
- Disabled/unsupported navigation marked with `aria-disabled`.

Remaining accessibility work should include automated browser-level audits, mobile screen-reader testing, reduced-motion review, and end-to-end keyboard testing.

## 17. Current limitations and remaining scope

### Product limitations

- Only FPT has a stock-detail route and trading flow.
- The authored UI focuses on LIMIT orders; the schema also represents STOP orders.
- There is no timed exchange simulator or automatic matching engine; fill is an explicit transactional service action.
- Rejection is represented in the domain but no current UI action generates a rejected order.
- User creation and enable/disable controls are not implemented.

### Data and backend limitations

- PostgreSQL is local/demo persistence and does not represent a production broker ledger.
- There are no external-style API Route Handlers yet.
- There is no real authentication.
- Authorization is role-based against seeded users, not an enterprise identity system.
- There is no live market feed.
- There is no websocket connection.
- The market's 5,000 instruments are currently included in the client-side module rather than paged from a mock API.

### UI limitations

- Desktop global search is disabled.
- Marketing navigation labels are not complete product links.
- Desktop logout is missing.
- `/dev/components` is not gated to development mode.
- Loading, network-disconnected, market-closed, API-error, 403, and session-expired components exist in design documentation but are not wired into route behavior.
- The project currently uses custom SVG charts instead of Recharts.
- The market uses pagination rather than TanStack Virtual.

### Security limitations

This is a portfolio demo, not a production authentication or trading system:

- Login credentials are not checked.
- Demo login chooses a seeded role without password verification.
- Persistent user/role records and transactional authorization exist, but this is not a production authentication boundary.
- All data should be treated as public, fictional demo information.

## 18. Testing and quality gates

### Available commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Current automated tests

The test suite contains 21 passing tests covering:

- Tailwind class merging.
- All Button size/style/state combinations.
- All FormField type/state combinations.
- All StatusBadge tone/style combinations.
- All MetricCard trends and non-color semantics.
- Loading skeleton variants.
- Empty and error state accessibility markup.
- Deterministic dashboard fixture coverage.
- Viewer, Trader, and Admin demo identity parsing.
- Viewer denial and Trader/Admin order permission.
- Buy fee and buying-power calculations.
- Quantity lot validation.
- Limit-price tick validation.
- Buying-power validation.
- Sell-position validation.
- Sell proceeds, remaining position, and realized P&L.
- Exact position, portfolio NAV, total-return, and allocation calculations.
- Submitted orders appearing in shared order state.
- Buy and sell fill effects on cash, buying power, positions, and realized P&L.
- Cancellation permission for Viewer, Trader ownership, and Admin.
- Terminal-state protection and one-time buy-reservation refunds.

Tests use Node's built-in test runner through `tsx`. Component tests render React components to static markup; there is not yet a browser-based end-to-end test suite.

### Last verified quality status

As of 2026-07-15:

- ESLint: passing.
- Strict TypeScript check: passing.
- Tests: 21/21 passing.
- Production build: passing.
- `git diff --check`: passing.
- Desktop and mobile Figma screenshot comparison: completed for implemented flows.

## 19. Local development

### Requirements

- Node.js compatible with Next.js 16.
- pnpm.

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

### Production build and run

```bash
pnpm build
pnpm start
```

### Demo access

Use either visible login action:

- Continue as Demo Trader.
- Continue as Viewer.

The displayed default credentials are:

```text
Email: demo.trader@finops.local
Password: finops-demo
```

These values are illustrative and are not validated.

### Reset deterministic business state

```bash
npm run db:seed
```

Signing out deletes only the session cookie. Running the seed command recreates the PostgreSQL demo dataset.

## 20. Repository structure

```text
finops/
├── app/
│   ├── dashboard/              Authenticated dashboard
│   ├── dev/components/         Shared component preview
│   ├── login/                  Login page and server actions
│   ├── market/                 Market and dynamic FPT detail routes
│   ├── orders/                 Order history and cancellation route
│   ├── portfolio/              Portfolio overview and position detail routes
│   ├── globals.css             Tokens, themes, typography, global styles
│   ├── layout.tsx              Root metadata, fonts, default dark theme
│   └── page.tsx                Marketing landing page
├── components/
│   ├── dashboard/              Equity visualization
│   ├── login/                  Interactive login form
│   ├── market/                 Realtime TanStack market table
│   ├── orders/                 Order list, filters, detail, and cancel dialog
│   ├── portfolio/              Portfolio analytics and position components
│   ├── shell/                  Desktop and mobile application shell
│   ├── trading/                FPT detail, tickets, dialogs, and charts
│   ├── ui/                     Reusable design-system components and tests
│   └── brand.tsx               FinOps brand component
├── docs/                       Figma handoff, maps, plans, decisions
├── lib/
│   ├── market-data.ts          5,000 deterministic instruments and order book
│   ├── mock-data.ts            Landing/equity demo fixtures
│   ├── portfolio.ts            Position, NAV, return, and allocation calculations
│   ├── session.ts              DB-backed demo session and HTTP-only cookie helpers
│   ├── trading.ts              Order schema, permission, estimates, validation
│   ├── utils.ts                Shared class utility
│   └── *.test.ts               Domain and fixture tests
├── public/                     Static starter assets
├── src/
│   ├── db/                     Drizzle client, domain schemas, deterministic seed
│   ├── repositories/           PostgreSQL data access
│   └── services/               Transactional business and query services
├── drizzle/                    Generated SQL migrations and metadata
├── drizzle.config.ts           Drizzle Kit configuration
├── AGENTS.md                   Project engineering rules
├── package.json                Scripts and dependencies
├── PROJECT_SUMMARY.md          This document
└── README.md                   Original create-next-app README
```

## 21. Engineering conventions

Project-specific rules from `AGENTS.md` include:

- Treat Figma as the visual source of truth.
- Inspect Foundations and Components before implementing screens.
- Use Server Components by default.
- Add Client Components only for interaction, browser APIs, or realtime state.
- Use deterministic mock data.
- Convert Figma variables into CSS custom properties.
- Reuse shared components instead of duplicating markup.
- Use Inter for product UI and IBM Plex Mono for financial numbers.
- Never use screenshots as page backgrounds.
- Use semantic HTML and keyboard-accessible controls.
- Give dialogs proper focus management.
- Give form controls labels and errors.
- Do not communicate profit/loss with color alone.
- Implement and review one vertical flow at a time.
- Run lint and type checking before finishing.
- Compare rendered browser screenshots with Figma.

## 22. Recommended next implementation phases

The most coherent continuation is:

1. Add a deterministic timed matching simulator if interactive fills are needed beyond seeded/tested lifecycle actions.
2. Add Route Handlers only when realtime streaming or external-style APIs are introduced.
3. Add browser-level tests for login, Viewer denial, Trader buy/sell, cancellation, fills, DB persistence and Admin workflows.
4. Wire product states: loading, empty, disconnected, market closed, API error, permission denied, session expired, and not found.
5. Replace or extend custom SVG financial charts with Recharts where interaction is required.

Each phase should follow the established workflow:

```text
Inspect Figma
  → identify reusable components
  → record dimensions and responsive behavior
  → implement one vertical flow
  → lint/typecheck/test/build
  → compare 1440px and 390px screenshots
  → correct discrepancies
```

## 23. Key project principles

- FinOps is a deterministic paper-trading demo, not a real trading platform.
- Visual fidelity and reusable architecture are equally important.
- Server rendering is the default; client state is intentionally scoped.
- Permissions must be enforced in domain/state boundaries, not only by hidden buttons.
- Financial calculations must remain explicit and testable.
- Mock data must be repeatable so tests and screenshots stay stable.
- Accessibility is a product requirement, not a finishing pass.
- New areas should be delivered as reviewable vertical slices rather than one large unreviewed application build.
