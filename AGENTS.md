# FinOps Portfolio — Engineering Instructions

## Product

FinOps is a professional paper-trading portfolio application.

Figma source of truth:
https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W

The application contains:

- Landing and authentication
- Dashboard
- Realtime market table
- Stock detail
- Buy and sell order flows
- Portfolio and order history
- Corporate actions
- Audit logs
- User management
- Settings
- RBAC: Viewer, Trader, Admin
- Performance Lab with 5,000 rows
- Desktop 1440px and mobile 390px

## Technical stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Server Components by default
- Client Components only for interactions, browser APIs and realtime state
- Zustand for client-side demo state
- Zod for validation
- TanStack Table and TanStack Virtual for large tables
- Recharts for financial charts
- Deterministic mocked APIs

## Design rules

- Figma is the visual source of truth.
- Read Foundations and Components before implementing screens.
- Do not use screenshots as page backgrounds.
- Do not hardcode repeated colors, spacing or radius values.
- Convert Figma variables into CSS custom properties.
- Reuse shared React components.
- Use IBM Plex Mono for financial numbers.
- Use Inter for product UI.
- Accent color: #C9DD03.
- Profit values are green.
- Loss values are red.
- No ACBS branding or internal company data.
- All financial information is simulated.

## Component rules

Create reusable components for:

- Button
- FormField
- StatusBadge
- MetricCard
- AppShell
- Sidebar
- Topbar
- DataTable
- Pagination
- Dialog
- Drawer
- OrderTicket
- EmptyState
- ErrorState
- LoadingSkeleton

Do not duplicate component markup across screens.

## Accessibility

- Use semantic HTML.
- All interactive elements must be keyboard accessible.
- Dialogs require focus management.
- Form controls require labels and error messages.
- Profit/loss must not rely only on color.

## Workflow

Before coding a Figma screen:

1. Inspect the frame through Figma MCP.
2. Identify reusable components.
3. Record dimensions and responsive behavior.
4. Implement one vertical flow.
5. Run lint and typecheck.
6. Compare the browser screenshot against Figma.
7. Fix discrepancies before moving on.

Never implement the entire application in one unreviewed change.