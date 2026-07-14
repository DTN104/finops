# Implementation Decision Register

## Status

Phase 1 is a contract review, not product implementation. Figma facts remain documented in the handoff files; the choices below are recommended implementation defaults and require approval before Phase 2.

## Locked inputs

- Next.js App Router, strict TypeScript, Tailwind CSS and Server Components by default.
- Client Components only for interaction, browser APIs and realtime state.
- Deterministic mock data; all financial information is simulated.
- Validation viewports: 1440 × 1024 desktop and 390 × 844 mobile.
- Roles and permissions: Viewer, Trader and Admin per the exact RBAC matrix in `route-map.md`.
- Figma variables, typography, four published component sets and product-state copy remain unchanged.

## Recommended defaults

### Routes

Use stable page routes only. Keep tickets, confirmations, drawers and success panels as local UI state because Figma presents them as overlays and defines no deep-link behavior.

| Screen | Route |
| --- | --- |
| Landing / Login / Dashboard | `/`, `/login`, `/dashboard` |
| Market / stock detail | `/market`, `/market/[symbol]` |
| Portfolio / position | `/portfolio`, `/portfolio/[symbol]` |
| Orders | `/orders` |
| Corporate actions / detail / create | `/corporate-actions`, `/corporate-actions/[id]`, `/corporate-actions/new` |
| Audit / users / settings | `/admin/audit-logs`, `/admin/users`, `/admin/settings` |
| Performance | `/performance-lab` |

Architecture and state-gallery boards remain documentation, not product routes.

### Responsive behavior

Use one responsive switch at Tailwind `lg` (`1024px`): mobile composition below 1024px and desktop composition at or above 1024px. Do not invent a tablet-only design; allow the mobile composition to expand fluidly. Validate exact matches at 390px and 1440px.

### Mock API boundaries

Use Next.js Route Handlers and native browser APIs; add no API framework.

| Method and path | Responsibility |
| --- | --- |
| `GET/POST/DELETE /api/session` | Read, create or expire the HTTP-only demo session |
| `GET /api/market` | Search, filter and page the 5,000 deterministic instruments |
| `GET /api/market/[symbol]` | Quote, company data, order book and current position |
| `GET /api/portfolio` | Summary, allocation, positions, lots and activity |
| `GET/POST /api/orders` | List or submit mock orders |
| `DELETE /api/orders/[id]` | Cancel the unfilled quantity after ownership/RBAC checks |
| `GET/POST /api/corporate-actions` | List events or create an Admin draft |
| `GET/PATCH /api/corporate-actions/[id]` | Read, edit or publish an Admin event |
| `GET /api/audit-logs` | Read immutable audit events as Admin |
| `GET/PATCH /api/users/[id]` | Read or change role/status as Admin |
| `GET/PATCH /api/settings` | Read or change Admin workspace settings |

Keep the 500ms quote simulator in-process and deterministic. The Performance Lab's 50ms benchmark remains isolated from product quote state.

### Order lifecycle

Reconcile the Figma-only `PENDING` row with the governance states using this branching model:

```text
DRAFT → SUBMITTED → PENDING → OPEN → PARTIAL → FILLED
                    └───────────────→ REJECTED
                    └───────────────→ CANCELLED
                               OPEN → CANCELLED
                            PARTIAL → CANCELLED
```

`FILLED`, `CANCELLED` and `REJECTED` are terminal. Cancelling preserves filled quantity. Invalid transitions produce a rejected audit event, as required by Figma.

### Corporate-action lifecycle

Use `DRAFT → ANNOUNCED → UPCOMING → COMPLETED`. Treat `ACTION NEEDED` as a derived display status for an upcoming event that requires investor action, not a separate lifecycle branch. Publishing moves DRAFT to ANNOUNCED, exposes the event to Viewer/Trader and writes an audit event.

### Prototype gaps

- Implement the intended navigation described by the Prototype Map even where Figma reactions are missing.
- `Continue as Viewer` creates a Viewer session and opens Dashboard.
- Mobile `Review order` follows the authored prototype directly to Portfolio until mobile confirmation/success screens exist.
- Keep 0.2s ease-out navigation motion, and respect reduced-motion preferences.

## Blocking decision

Figma provides Trader and Viewer login actions but no Admin authentication path, while Admin screens are required. Choose one before implementing auth:

1. Add a third `Continue as Admin` demo action to Login.
2. Use a separate seeded Admin credential with the existing form and no third action.

Recommendation: option 2 changes no authored login layout and keeps role selection in credentials/session data.
