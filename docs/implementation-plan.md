# Figma Implementation Plan

## Guardrails

This plan is based on Figma file `m9MmphEJzKBmIiKrLSuR0W`; no product code has been written. The repository is currently a minimal Next.js 16 / React 19 App Router scaffold. Figma specifies product behavior and conceptual modules, but not production URL paths or executable API schemas.

## Authored architecture

| Layer | Figma description | Named modules |
| --- | --- | --- |
| Presentation | App Router layouts; Server/Client Components; charts; virtualized tables | Landing (`src/landing`), Dashboard (`src/dashboard`), Trading (`src/trading`), Admin UI (`src/admin-ui`) |
| Application | Use cases; validation; permission gates; cache/query adapters | MarketService (`src/marketservice`), TradeService (`src/tradeservice`), PortfolioService (`src/portfolioservice`), AuditService (`src/auditservice`) |
| Domain | Orders; positions; corporate events; user roles; audit entities | Order State Machine (`src/order-state-machine`), RBAC Policy (`src/rbac-policy`), PnL Calculator (`src/pnl-calculator`), CA Engine (`src/ca-engine`) |
| Infrastructure | Mock REST APIs; websocket simulator; in-memory persistence; seed fixtures | Market API (`src/market-api`), Trade API (`src/trade-api`), Auth API (`src/auth-api`), Event Stream (`src/event-stream`) |

Engineering notes in Figma require server-fetched session and initial portfolio, client state only for interactive tables/dialogs/charts, seeded deterministic data, and a structured audit event for every sensitive mutation.

## Mock API contract surface

Figma does not provide HTTP methods, endpoint paths, JSON keys, field types, status codes or full error schemas. The table below is therefore the complete design-level contract—not a guessed wire contract.

| Boundary | Exact behavior and fields visible in Figma | Exact transport information |
| --- | --- | --- |
| Auth API | Demo Trader and Viewer login choices; roles Viewer, Trader, Admin; HTTP-only demo session; session expires after 30 minutes of inactivity; permission flow is server check → route guard → UI capability gate | `mock REST APIs` and `HTTP-only demo session`; no endpoint or payload |
| Market API | 5,000 mock HOSE instruments; market table fields `Symbol`, `Company`, `Last`, `Change`, `Volume`, `Bid`, `Ask`, `Status`; detail fields `Open`, `High`, `Low`, `Prev close`, `Volume`, `Market cap`; order-book fields `Price`, `Qty`, `Total` | Product quote cadence is 500 ms. Realtime flow is `Mock socket → update buffer → batch reducer → normalized store → memoized visible rows` |
| Trade API | Buy/sell review and submit; cancel unfilled quantity; fields `Order ID`, `Symbol`, `Side`, `Type`, `Qty`, `Price`, `Filled`, `Status`, `Time`; estimate fields include fee, estimated total/proceeds, buying power after or position remaining. Example ID: `MOCK-20260714-1042` | Mock REST service named `src/trade-api`; no method, endpoint or payload. API-error example includes trace `MOCK-7F21` |
| PortfolioService | Net portfolio value, market value, cash/buying power, total return, positions, allocation, tax lots and activity. Position fields include quantity, average cost, last, market value, unrealized P&L and weight | Application service only; no transport contract |
| CA Engine | Event fields `Symbol`, `Event`, `Type`, `Ex-date`, `Record date`, `Payment date`, `Status`, `Action`; detail adds event reference, source, currency, tax rate, investor-action flag and portfolio impact | No API boundary, endpoint or payload is defined |
| AuditService / Event Stream | Audit fields `Time`, `Actor`, `Action`, `Module`, `Resource`, `IP / Session`, `Outcome`; detail adds event ID, timestamp, before/after and `integrity_hash` | Structured events are required for sensitive mutations; no event envelope or channel name is defined |

The Performance Lab is a separate benchmark contract: 5,000 rows, 100 symbol updates every 50 ms, with optimized and baseline pipelines. It must not be silently substituted for the product's 500 ms quote cadence.

## Order state machine

The governance frame displays this exact left-to-right sequence, with an arrow after every label:

```text
DRAFT → SUBMITTED → OPEN → PARTIAL → FILLED → CANCELLED → REJECTED →
```

It also states: only declared transitions are permitted; invalid transitions emit a rejected audit event; estimate plus fees cannot exceed buying power; orders are disabled when the simulated market is closed; Traders may cancel only their own orders; filled quantities are immutable.

Observed order UI adds `PENDING`, which is absent from the governance sequence. The Orders table contains OPEN, PARTIAL and PENDING examples. Buy and sell success screens create OPEN orders; sell holdings remain unchanged until fill; cancel confirmation applies only to unfilled quantity. Figma does not define legal branching, terminal states, partial-fill transitions, or whether the arrows after FILLED/CANCELLED/REJECTED are intentional. Resolve this before implementing the reducer or mock Trade API.

## Corporate-action states

| State shown | Exact context |
| --- | --- |
| `DRAFT` | Create form and Review & Publish overlay |
| `ANNOUNCED` | HPG bonus shares and MWG stock dividend rows |
| `UPCOMING` | FPT/VNM cash dividends and GAS bond maturity rows |
| `ACTION NEEDED` | VCB voting (`Vote`) and SSI rights offering (`Review`) |

Publishing is described as making an event visible to Viewer and Trader roles and creating an audit entry. `Completed YTD` is a metric, but no `COMPLETED` row state is shown. No post-publish status, transition graph, cancellation state or settlement transition is defined.

## Loading, empty and error behavior

- Loading: `Page loading` with `Table skeleton`.
- Empty portfolio: `No positions yet. Place a mock trade to begin.`, metadata `₫500M buying power`, action `Explore Market`.
- Empty orders: `No orders match the selected filters.`, metadata `0 results`, action `Clear filters`.
- API error: mock Trade API rejection, trace `MOCK-7F21`, action `Try again`.
- Network error: realtime prices paused, `Retrying in 3s`, action `Retry now`.
- 403: permission to manage users denied for Viewer, action `Request Admin access`.
- 404: missing demo route, example `/portfolio/missing`, action `Back to Dashboard`.
- Additional global states: session expired and market closed.

## Implementation phases

1. **Resolve contracts.** Review and approve the working defaults in `decision-register.md`, including the Admin authentication choice. This phase produces decisions only.
2. **Foundations.** Add all Figma color, spacing, radius and typography variables; load Inter and IBM Plex Mono; support Light/Dark modes; reproduce the three effect styles. Validate at 1440px and 390px.
3. **Published components.** Implement only Button, Form Field, Status Badge and Metric Card with their exact Figma variants. Add checks for all authored states before extracting any other repeated pattern.
4. **Shell, auth and states.** Build public, workspace, administration and mobile shells; server session/RBAC gates; 403, 404, session, market, network, API, empty and loading treatments.
5. **Market and trading.** Add deterministic market data, 500 ms stream, market/detail views, buy/sell review and success flows, then the clarified order reducer and audit events.
6. **Portfolio, orders and corporate actions.** Add portfolio/position views, orders and cancellation, then Admin-only corporate-action create/review/publish behavior.
7. **Administration.** Add audit list/drawer, user role editing and settings with the exact RBAC matrix and immutable audit history.
8. **Performance and mobile.** Implement the 5,000-row optimized/baseline lab, then the seven 390px screens and the verified prototype journeys.

Each phase should finish with lint/build checks, visual comparison at authored viewport sizes, role checks, and the relevant loading/empty/error states.

## Decisions still required

- Figma's `src/...` module paths conflict with the repository's current root `app/` layout.
- Breakpoint thresholds, tablet behavior and URLs are unspecified.
- API contracts stop at service responsibilities and visible fields.
- The order diagram appears linear through mutually exclusive terminal states and omits PENDING.
- Corporate-action workflow has no formal transition model or post-publish state.
- The Prototype Map claims eight states but the gallery shows nine.
- Operations/admin/engineering links are described on the map but have no prototype reactions; Viewer and Admin authentication paths are incomplete.
