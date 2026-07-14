# Figma Route and Prototype Map

## Route hierarchy

Figma does not define production URL paths. The hierarchy below uses authored screen names and relationships; it must not be read as a pathname proposal.

```text
Public
├── Landing / Desktop (11:2)
└── Login / Desktop (12:2)

Authenticated workspace
├── Dashboard / Desktop (13:2)
├── Market / Desktop (13:152)
│   └── FPT Stock Detail / Desktop (15:8)
│       ├── Trade Ticket / Buy FPT (16:11)
│       │   └── Trade Confirm / Buy FPT (16:212)
│       │       └── Trade Success / Buy FPT (16:406)
│       └── Trade Ticket / Sell FPT (26:26)
│           └── Trade Confirm / Sell FPT (26:233)
│               └── Trade Success / Sell FPT (26:431)
├── Portfolio Overview / Desktop (17:2)
│   └── Position Detail / FPT (17:195)
├── Orders / Desktop (17:329)
│   └── Cancel Order / Confirmation (17:469)
├── Corporate Actions / Desktop (19:2)
│   ├── Corporate Action Detail / FPT (19:162)
│   └── Corporate Action Form / Create (19:281)
│       └── Corporate Action / Review & Publish (19:400)
├── Audit Logs / Desktop (20:2)
│   └── Audit Log Detail / Drawer (20:152)
├── User Management / Desktop (20:335)
│   └── User Management / Edit Role (20:478)
├── Settings / Desktop (20:639)
└── Performance Lab
    ├── Performance Lab / Optimized (21:2)
    └── Performance Lab / Baseline (21:324)

Reference views
├── Architecture / System Overview (22:2)
├── Architecture / Governance & State (22:95)
└── Product State Gallery (22:178)

Mobile 390px
├── Mobile / Login (23:2)
├── Mobile / Dashboard (23:29)
├── Mobile / Market (23:108)
│   └── Mobile / FPT Detail (23:205)
│       └── Mobile / Buy FPT Sheet (23:298)
├── Mobile / Portfolio (23:413)
└── Mobile / Orders (23:504)
```

The only pathname-like string in the file is `/portfolio/missing`, used as 404 example copy.

## RBAC matrix

Exact matrix from `Architecture / Governance & State`:

| Capability | Viewer | Trader | Admin |
| --- | :---: | :---: | :---: |
| View market & portfolio | ✓ | ✓ | ✓ |
| Submit mock orders | — | ✓ | ✓ |
| Cancel own orders | — | ✓ | ✓ |
| Create corporate actions | — | — | ✓ |
| Manage users & roles | — | — | ✓ |
| View audit logs | — | — | ✓ |
| Change system settings | — | — | ✓ |

Additional authored rules: order estimate plus fees must not exceed buying power; new orders are disabled while the simulated market is closed; Traders may cancel only orders created by their identity; filled quantities and audit entries are immutable. Authentication is described as `HTTP-only demo session → server permission check → route guard → UI capability gate`.

## Prototype-map journeys

The map board describes four sequences:

- Core: Landing → Login → Dashboard → Market → FPT Detail → Buy Ticket → Confirm → Success → Portfolio → Orders.
- Operations: CA List → CA Detail → CA Form → Review Publish → Audit Logs → User Management → Settings.
- Engineering: Performance Optimized → Performance Baseline → System Architecture → RBAC & State → State Gallery.
- Mobile: Login → Dashboard → Market → FPT Detail → Buy Sheet → Portfolio → Orders.

It also contains an implemented desktop sell branch: FPT Detail → Sell Ticket → Sell Confirm → Sell Success → Orders or Portfolio.

## Actual prototype reactions

Every authored reaction is `ON_CLICK`, navigates with a 0.2-second `DISSOLVE` / `EASE_OUT`, and resets scroll position.

| Source screen | Trigger node | Destination screen |
| --- | --- | --- |
| Prototype / Landing | Button / Sign in | Prototype / Login (`25:88`) |
| Prototype / Landing | Button / Start as Demo Trader | Prototype / Login (`25:88`) |
| Prototype / Login | Button / Continue as Demo Trader | Prototype / Dashboard (`25:128`) |
| Prototype / Dashboard | Nav / Market | Prototype / Market (`25:278`) |
| Prototype / Market | Market Row / FPT | Prototype / FPT Detail (`25:466`) |
| Prototype / FPT Detail | Button / Buy FPT | Prototype / Buy Ticket (`25:633`) |
| Prototype / Buy Ticket | Button / Review order | Prototype / Confirm (`25:837`) |
| Prototype / Confirm | Button / Place mock order | Prototype / Success (`25:1034`) |
| Prototype / Success | Button / View portfolio | Prototype / Portfolio (`25:1224`) |
| Prototype / Success | Button / Back to market | Prototype / Market (`25:278`) |
| Prototype / Portfolio | Nav / Orders | Prototype / Orders (`25:1417`) |
| Prototype / Portfolio | Holding / FPT | Prototype / FPT Detail (`25:466`) |
| Prototype / FPT Detail | Button / Sell | Prototype / Sell Ticket (`30:48`) |
| Prototype / Sell Ticket | Button / Review sell order | Prototype / Sell Confirm (`30:258`) |
| Prototype / Sell Confirm | Button / Place mock sell order | Prototype / Sell Success (`30:459`) |
| Prototype / Sell Success | Button / View orders | Prototype / Orders (`25:1417`) |
| Prototype / Sell Success | Button / Back to portfolio | Prototype / Portfolio (`25:1224`) |
| Prototype / Mobile Login | Button / Continue as Demo Trader | Prototype / Mobile Dashboard (`25:1584`) |
| Prototype / Mobile Dashboard | Nav / Market | Prototype / Mobile Market (`25:1663`) |
| Prototype / Mobile Market | Market Row / FPT | Prototype / Mobile FPT (`25:1760`) |
| Prototype / Mobile FPT | Button / Buy | Prototype / Mobile Buy (`25:1853`) |
| Prototype / Mobile Buy | Button / Review order | Prototype / Mobile Portfolio (`25:1970`) |
| Prototype / Mobile Portfolio | Nav / Orders | Prototype / Mobile Orders (`25:2061`) |

## Routing states

- Unauthorized access uses the authored 403 treatment: `Permission denied` with `Request Admin access`.
- Unknown routes use the authored 404 treatment: `Page not found` with `Back to Dashboard`.
- An expired 30-minute demo session routes the user back through `Sign in again`.

## Unclear or inconsistent routing details

- URL paths, dynamic segment names and query parameters are not specified.
- The map says operations and admin paths are linked, but no prototype reactions target Corporate Actions, Audit Logs, User Management, Settings, Performance or Architecture screens.
- `Continue as Viewer` exists on desktop and mobile login designs but has no prototype reaction. No Admin sign-in path is shown.
- Mobile `Review order` goes directly to Mobile Portfolio; no mobile confirmation or success frame exists.
- Desktop prototype navigation is only partially wired; most sidebar items have no reactions.
