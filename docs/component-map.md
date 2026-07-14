# Figma Component Map

## Published component sets

These are the only local component sets on `02 — Components`.

| Set | Figma ID | Authored API | Variants |
| --- | --- | --- | --- |
| Button | `10:2` | `style • size • state • label` | Size: Small, Medium, Large; Style: Primary, Secondary, Danger; State: Default, Hover, Disabled. 27 combinations. |
| Form Field | `29:86` | `type • state • label • value • helper` | Type: Text, Search, Select; State: Default, Focus, Error, Disabled. 12 combinations. |
| Status Badge | `31:36` | `tone • style • label` | Tone: Neutral, Info, Success, Warning, Danger; Style: Soft, Solid. 10 combinations. |
| Metric Card | `31:61` | `trend • label • value • supporting` | Trend: Neutral, Positive, Negative, Warning. 4 combinations. |

Component property defaults are Button `Small / Primary / Default / "Button"`; Form Field `Text / Default / "Label" / "Input value" / "Helper text"`; Status Badge `Neutral / Soft / "STATUS"`; Metric Card `Neutral / "Net portfolio value" / "₫1.284B" / "+2.79% today"`.

## Shared pattern inventory

The patterns below recur in screens but are ordinary frames or instances, not additional local component sets.

| Pattern | Evidence in Figma | Required variants or content visible in Figma |
| --- | --- | --- |
| Desktop workspace shell | Trading, Portfolio, Orders, Corporate Actions | 232px sidebar, 72px top bar, search, environment status, user role, active navigation |
| Administration shell | Audit Logs, User Management, Settings | `ADMINISTRATION` navigation, Admin identity and `AUDIT ENABLED` status |
| Mobile shell | All seven 390px screens | Status bar, compact header and five-item bottom navigation |
| Data table | Market, Positions, Orders, Corporate Actions, Audit Logs, Users, Performance Lab | Header, rows, numeric mono cells, status cells, selection and pagination/filter controls where shown |
| Chart panel | Dashboard, stock detail, portfolio, performance, mobile | Equity, price and allocation presentations; no chart component API is defined |
| Confirmation dialog | Buy/sell confirm, cancel order, publish event | Eyebrow, title, explanatory copy, review fields, primary action and Back/Keep action |
| Drawer | Audit Log Detail | Scrim, right-side detail panel, close action, before/after data |
| Order ticket | Desktop buy/sell and mobile buy sheet | Side, order type, quantity, limit price, estimate, fee/impact and review action |
| Filters and tabs | Market, Orders, Corporate Actions, Audit, Users | Search, select-like buttons, time filters and active state |
| Skeleton state | Product State Gallery | `Page loading` with `Table skeleton` |

Do not treat these as already-specified Figma components. Their repeated geometry supports reuse, but props and variants remain undefined.

## Product-state inventory

`11 — States & Architecture` authors these state treatments:

| State | Exact message / metadata | Action |
| --- | --- | --- |
| 403 | `Permission denied`; `You do not have permission to manage users.`; `Viewer role` | `Request Admin access` |
| 404 | `Page not found`; `The requested route does not exist in this demo.`; `/portfolio/missing` | `Back to Dashboard` |
| Session | `Session expired`; `Your demo session ended after 30 minutes of inactivity.`; `Authentication required` | `Sign in again` |
| Market | `Market closed`; `Order entry is unavailable outside the simulated session.`; `Reopens 09:00` | `View market data` |
| Network | `Network disconnected`; `Realtime prices are paused while the feed reconnects.`; `Retrying in 3s` | `Retry now` |
| API error | `The mock trade API rejected the request unexpectedly.`; `TRACE MOCK-7F21` | `Try again` |
| Empty portfolio | `No positions yet. Place a mock trade to begin.`; `₫500M buying power` | `Explore Market` |
| Empty orders | `No orders match the selected filters.`; `0 results` | `Clear filters` |
| Loading | `Page loading`; `Table skeleton` | None shown |

## Status coverage

- Orders show `PENDING`, `OPEN` and `PARTIAL`; the governance diagram also names `DRAFT`, `SUBMITTED`, `FILLED`, `CANCELLED` and `REJECTED`.
- Corporate Actions show `DRAFT`, `ANNOUNCED`, `UPCOMING` and `ACTION NEEDED`.
- User states show `ACTIVE` and `DISABLED`; audit outcomes show `SUCCESS` and `DENIED`.
- Market and performance rows show `TRADING`, `IDLE` and `UPDATED`.

No mapping from these labels to Status Badge tones/styles is defined in Figma.

## Unclear or inconsistent component details

- The Prototype Map says `8 product states`, but the State Gallery contains nine distinct treatments listed above.
- Button lacks Focus, Pressed and Loading states; Form Field lacks Read-only and Success states.
- Dialog, drawer, table, chart, tabs, pagination, skeleton and mobile bottom sheet are not componentized in Figma.
- Icons are often text glyphs (`⌕`, `⌄`, `＋`, `◫`, `≡`) rather than a named icon set.
- No accessibility annotations, keyboard behavior, focus order or reduced-motion behavior are specified.
