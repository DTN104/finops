# FinOps Portfolio — Detailed Project Summary

> Last updated: 2026-07-15  
> Repository version: `0.1.0`  
> Status: Two working vertical slices are implemented; the broader Figma product remains partially planned.

## 1. Executive summary

FinOps is a responsive professional paper-trading portfolio application. It demonstrates a realistic financial workspace without connecting to real brokerage infrastructure, real funds, real securities, or internal company data.

The current application supports two end-to-end vertical slices:

1. `Landing → Login → Demo user → Dashboard`
2. `Dashboard → Market → FPT stock detail → Buy or Sell → Confirm → Success`

The implementation is built with the Next.js App Router, strict TypeScript, Tailwind CSS, Server Components by default, an HTTP-only mock session, Zustand for browser-side portfolio state, Zod for order validation, and TanStack Table for the market experience.

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

Only the landing/authentication/dashboard and market/FPT trading slices are implemented at this time. See [Current limitations and remaining scope](#17-current-limitations-and-remaining-scope) for the exact boundary.

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

The implemented screens were visually compared against the corresponding Figma desktop and mobile frames. The trading overlays were also checked against authored dimensions, including the desktop order drawer, confirmation dialogs, success dialogs, and mobile buy sheet.

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
| Zustand | `^5.0.14` | Persisted client-side demo portfolio and order state |
| Zod | `^4.4.3` | Session-role parsing and order validation |
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

The product specification names Recharts and TanStack Virtual for later phases. They are not currently installed or used. Current financial charts are deterministic inline SVG, and the market uses TanStack Table pagination rather than virtualization.

## 5. Application routes

### Implemented routes

| Route | Rendering | Access | Purpose |
| --- | --- | --- | --- |
| `/` | Static Server Component | Public | Marketing landing page and product preview |
| `/login` | Static shell + client form | Public | Demo Trader or Viewer sign-in |
| `/dashboard` | Dynamic Server Component | Authenticated | Portfolio metrics, equity curve, watchlist, and holdings |
| `/market` | Dynamic Server Component + client table | Authenticated | Realtime-style 5,000-instrument market |
| `/market/[symbol]` | Dynamic Server Component + client trading flow | Authenticated | FPT stock detail and mock order entry |
| `/dev/components` | Static development route | Public in current code | Shared component preview/gallery |

`/market/[symbol]` currently accepts only `FPT`, case-insensitively. Any other symbol calls Next.js `notFound()`.

### Planned but not implemented routes

The architecture documents propose the following future routes:

- `/portfolio`
- `/portfolio/[symbol]`
- `/orders`
- `/corporate-actions`
- `/corporate-actions/[id]`
- `/corporate-actions/new`
- `/admin/audit-logs`
- `/admin/users`
- `/admin/settings`
- `/performance-lab`

These are not production routes in the current repository.

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

The email, password, remember-device, and forgot-password controls are presentation-only. Authentication currently trusts the submitted demo role; it does not verify credentials against a user database.

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

Dashboard values are static fixtures from `lib/mock-data.ts`. They do not yet read from the persisted trading store, so submitting an order does not update the dashboard cards.

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
  → Dashboard or Market
```

An accepted mock buy order is stored as `OPEN` and immediately reserves its estimated total from buying power. There is no fill simulator yet, so the FPT position itself is not increased.

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

An accepted sell order is stored as `OPEN`. The persisted position remains unchanged until a future fill engine exists, which is also explained in the success state.

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

The 30-minute value is cookie lifetime, not true idle-time tracking. There is no database, refresh token, password verification, CSRF-specific token, or external identity provider.

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

The implemented trading slice enforces order-entry permission in two places:

1. UI/domain validation through `canPlaceOrders()` and `validateOrder()`.
2. The Zustand store rejects Viewer submissions independently.

Current behavior:

- Viewer can browse Dashboard, Market, and FPT detail.
- Viewer trade buttons are disabled and a read-only message is shown.
- Trader can submit mock buy and sell orders.
- Admin is recognized by the session/domain model and can submit orders.
- Admin-specific routes and controls are not implemented.

## 9. Trading validation and calculations

Order input is validated with the Zod schema in `lib/trading.ts`.

### Schema rules

- Symbol must currently be exactly `FPT`.
- Side must be `buy` or `sell`.
- Order type must be `LIMIT`.
- Quantity must be a positive whole number.
- Quantity must use 100-share lots.
- Limit price must be a positive whole number.
- Limit price must use ₫100 ticks.
- Viewer users cannot place orders.
- Buy total including fees cannot exceed buying power.
- Sell quantity cannot exceed the available FPT position.

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

The order is revalidated immediately before submission using the latest Zustand state. This prevents a stale confirmation dialog from bypassing current buying-power or position checks.

## 10. Client-side portfolio state

The shared demo portfolio is defined in `components/trading/portfolio-store.ts`.

### Initial state

```text
Buying power: ₫486,200,000
FPT quantity: 2,400 shares
FPT average cost: ₫112,100
Orders: []
Next order sequence: 1042
```

### Persistence

- Zustand's `persist` middleware writes to browser local storage.
- Storage key: `finops-demo-portfolio`.
- Store version: `1`.
- State is local to the browser profile/device.
- State is not connected to the HTTP-only session identity.
- Clearing browser storage resets persisted portfolio/order state.
- The store exposes a `reset()` action for deterministic development/testing workflows.

### Submitted order shape

Each order contains:

- Symbol.
- Buy or sell side.
- Quantity.
- Limit price.
- `LIMIT` order type.
- Deterministic order ID.
- `OPEN` status.
- Deterministic submitted time.
- Actor name.
- Full calculated estimate.

Order IDs begin with `MOCK-20260714-1042` and increment locally.

## 11. Deterministic mock data

### Dashboard fixtures

`lib/mock-data.ts` provides:

- Four dashboard metrics.
- Twenty-five equity-bar heights.
- Five watchlist symbols.
- Four top holdings.
- A fixed display date.

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
- Browser-local Zustand state and persistence.

### Main runtime flow

```text
Browser request
  → Next.js Server Component route
  → HTTP-only session lookup
  → redirect if unauthenticated
  → server-rendered AppShell
  → interactive MarketTable or StockDetail client boundary
  → Zod/domain validation
  → Zustand persisted mock portfolio
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
| `usePortfolioStore` | Persisted buying power, positions, orders, and submission |

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

### Mobile

- Compact status bar and 62px product header.
- 72px bottom navigation.
- Single-column content.
- Market quote cards/list instead of the desktop table.
- Order book hidden.
- Buy/sell actions fixed within normal content flow above bottom navigation.
- 390px-wide, 560px-high order bottom sheet at the authored viewport.
- Mobile-friendly paired quantity and price inputs.

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

- Portfolio overview/detail routes are not implemented.
- Order history and cancellation are not implemented.
- Corporate actions are not implemented.
- Audit logs are not implemented.
- User management is not implemented.
- Settings are not implemented.
- Performance Lab is not implemented.
- Admin has no visible login action or admin workspace.
- Only FPT has a stock-detail route and trading flow.
- Only LIMIT orders are supported.
- There is no order matching, partial fill, fill, cancellation, or rejection engine.
- Submitted sell orders do not change the position until a future fill mechanism exists.
- Submitted buy orders reserve buying power but do not create filled shares.
- Dashboard metrics do not synchronize with the Zustand trading store.
- Success buttons currently return to Dashboard or Market because Portfolio and Orders routes do not exist.

### Data and backend limitations

- There is no database.
- There are no API route handlers.
- There is no real authentication.
- There is no real authorization service.
- There is no live market feed.
- There is no websocket connection.
- There is no server-side order state.
- Browser-local state can be modified by the user and is not trustworthy.
- Demo portfolio state is not isolated by session role or user identity.
- The market's 5,000 instruments are currently included in the client-side module rather than paged from a mock API.

### UI limitations

- Desktop global search is disabled.
- Several desktop/mobile navigation entries are intentionally disabled placeholders.
- Marketing navigation labels are not complete product links.
- Desktop logout is missing.
- `/dev/components` is not gated to development mode.
- Loading, network-disconnected, market-closed, API-error, 403, and session-expired components exist in design documentation but are not wired into route behavior.
- The project currently uses custom SVG charts instead of Recharts.
- The market uses pagination rather than TanStack Virtual.

### Security limitations

This is a portfolio demo, not a production authentication or trading system:

- Login credentials are not checked.
- A role value is trusted by the server action after enum parsing.
- There is no persistent server-side user or permission record.
- Client-side portfolio enforcement is not a secure authorization boundary.
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

The test suite contains 15 passing tests covering:

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

Tests use Node's built-in test runner through `tsx`. Component tests render React components to static markup; there is not yet a browser-based end-to-end test suite.

### Last verified quality status

As of 2026-07-15:

- ESLint: passing.
- Strict TypeScript check: passing.
- Tests: 15/15 passing.
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

### Reset local trading state

Remove the browser local-storage entry:

```text
finops-demo-portfolio
```

Signing out deletes the session cookie but does not currently clear the persisted portfolio store.

## 20. Repository structure

```text
finops/
├── app/
│   ├── dashboard/              Authenticated dashboard
│   ├── dev/components/         Shared component preview
│   ├── login/                  Login page and server actions
│   ├── market/                 Market and dynamic FPT detail routes
│   ├── globals.css             Tokens, themes, typography, global styles
│   ├── layout.tsx              Root metadata, fonts, default dark theme
│   └── page.tsx                Marketing landing page
├── components/
│   ├── dashboard/              Equity visualization
│   ├── login/                  Interactive login form
│   ├── market/                 Realtime TanStack market table
│   ├── shell/                  Desktop and mobile application shell
│   ├── trading/                FPT detail, tickets, dialogs, store, charts
│   ├── ui/                     Reusable design-system components and tests
│   └── brand.tsx               FinOps brand component
├── docs/                       Figma handoff, maps, plans, decisions
├── lib/
│   ├── market-data.ts          5,000 deterministic instruments and order book
│   ├── mock-data.ts            Dashboard fixtures
│   ├── session.ts              Demo users and HTTP-only cookie helpers
│   ├── trading.ts              Order schema, permission, estimates, validation
│   ├── utils.ts                Shared class utility
│   └── *.test.ts               Domain and fixture tests
├── public/                     Static starter assets
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

1. Build Portfolio and Orders so trading success actions have real destinations.
2. Connect Dashboard metrics, positions, and open orders to a shared deterministic domain store.
3. Add order lifecycle behavior: pending/open/partial/filled/cancelled/rejected.
4. Introduce deterministic mock Route Handlers for session, market, portfolio, and orders.
5. Add browser-level tests for login, Viewer denial, Trader buy, Trader sell, and persistence.
6. Implement corporate actions.
7. Implement Admin authentication choice, audit logs, user management, and settings.
8. Implement Performance Lab with TanStack Virtual and the 5,000-row benchmark.
9. Wire product states: loading, empty, disconnected, market closed, API error, permission denied, session expired, and not found.
10. Replace or extend custom SVG financial charts with Recharts where interaction is required.

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

