# FinOps — Dockview Customizable Dashboard Specification

**Status:** Ready for implementation  
**Target:** Existing FinOps Next.js application  
**Library:** `dockview-react`  
**Figma file:** https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W  
**Scope:** Desktop Dashboard customization only; preserve the current mobile dashboard

---

## 1. Purpose

Enhance the existing FinOps Dashboard so each user can customize their workspace:

- Drag and dock dashboard widgets.
- Resize widget groups with splitters.
- Maximize one widget and restore it.
- Minimize a widget into a compact rail and restore it.
- Add optional widgets from a widget library.
- Remove optional widgets.
- Reset to the default layout.
- Save and restore each user's layout.
- Preserve the current FinOps visual design and existing data flows.

This is a retrofit. Do not regenerate the Dashboard, routes, design system, charts, tables, Drizzle schemas, or Figma-matched styling that already work.

---

## 2. Figma source of truth

Use these frames through Figma MCP:

| State | Node | Figma URL |
|---|---:|---|
| Default customizable dashboard | `68:43` | https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W?node-id=68-43 |
| Edit layout / drag and drop | `68:253` | https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W?node-id=68-253 |
| Equity curve maximized | `68:489` | https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W?node-id=68-489 |
| Watchlist minimized | `68:699` | https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W?node-id=68-699 |
| Add Widget drawer | `68:905` | https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W?node-id=68-905 |

### Required visual details

- Preserve the current sidebar, top bar, typography, colors, radius, tables, charts, and spacing.
- Each dockable widget has a 36px dock header.
- Header content:
  - Dedicated drag grip.
  - Widget title.
  - Minimize button.
  - Maximize/restore button.
  - Overflow menu.
- Splitters use the existing FinOps border color and become accent colored in edit mode.
- Edit mode applies the FinOps accent outline and visible docking zones.
- The maximized state keeps the application sidebar and top bar visible.
- The minimized state displays a narrow widget rail on the right.
- The Add Widget interface is a right-side drawer with a backdrop.

---

## 3. Supported widgets

### Initial installed widgets

| Panel ID | Display name | Dockable | Minimizable | Maximizable | Removable |
|---|---|---:|---:|---:|---:|
| `account-overview` | Account overview | Yes | No | No | No |
| `equity-curve` | Equity curve | Yes | Yes | Yes | No |
| `watchlist` | Watchlist | Yes | Yes | Yes | Yes |
| `top-holdings` | Top holdings | Yes | Yes | Yes | No |

The four metric cards remain inside the single `account-overview` panel. Do not create four independent Dockview panels for them.

### Optional widgets

| Panel ID | Display name | Initial status |
|---|---|---|
| `market-heatmap` | Market heatmap | Available |
| `order-activity` | Order activity | Available |
| `news-events` | News & events | Available |
| `performance-snapshot` | Performance snapshot | Available |

Optional widgets may initially use the data/components already available in the repository. Do not invent external APIs.

---

## 4. Default layout

Desktop default layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Account overview — full width                           │
├──────────────────────────────────┬──────────────────────┤
│ Equity curve — approximately 65% │ Watchlist — 35%      │
├──────────────────────────────────┴──────────────────────┤
│ Top holdings — full width                               │
└─────────────────────────────────────────────────────────┘
```

Use stable panel IDs. Never generate a new random panel ID on each render.

---

## 5. Interaction requirements

### 5.1 Drag and dock

- Drag starts only from the dedicated grip in the dock header.
- Supported targets:
  - Top
  - Bottom
  - Left
  - Right
  - Center/tab group
- Edit mode displays docking zones matching Figma.
- A translucent drag preview follows the widget.
- Dropping in the center creates or joins a tab group.
- The layout must remain inside the Dashboard content area.
- Dragging must not interfere with chart hover, table scrolling, text selection, buttons, or links.

### 5.2 Resize

- Use Dockview's native splitters.
- Horizontal and vertical resizing must be supported.
- Minimum panel sizes:
  - `account-overview`: width 560px, height 132px
  - `equity-curve`: width 480px, height 300px
  - `watchlist`: width 300px, height 260px
  - `top-holdings`: width 560px, height 220px
- Charts and tables must respond to panel size changes.
- Avoid fixed chart widths. Use `ResizeObserver` or the existing responsive chart behavior.
- Do not persist layout on every pointer movement. Persist after the mutation settles.

### 5.3 Maximize and restore

- Use Dockview's native group maximize/restore behavior.
- Maximize affects only the Dashboard workspace. The FinOps sidebar and top bar remain visible.
- Restore via:
  - Restore button
  - Re-clicking maximize when appropriate
  - `Escape`
- Only one group may be maximized at a time.
- Listen for maximized-group changes so the UI icon and accessible label remain accurate.

### 5.4 Minimize and restore

Generic Dockview group collapse is intended for edge groups, not normal center-grid panels. Do not pretend that a normal panel supports a universal `collapse()` API.

Implement minimization as an application-level feature:

1. Capture panel metadata and its last useful dock position.
2. Remove the panel from the active Dockview layout.
3. Add the panel ID to `minimizedPanelIds`.
4. Render it in `MinimizedWidgetRail`.
5. Restore it with `api.addPanel(...)`, preferably near its previous group.
6. If its previous group no longer exists, restore it using the registry's default position.
7. Remove its ID from `minimizedPanelIds`.

The minimized rail:

- Appears at the right edge of the Dashboard workspace.
- Shows widget title vertically, icon, and optional count.
- Supports click and keyboard activation.
- Does not cover the main scroll area.
- Is persisted separately from Dockview's serialized layout.

### 5.5 Add Widget drawer

- Opened by `+ Add widget`.
- Search widgets by title and description.
- Installed widgets display `Installed`/`Added` and cannot be duplicated.
- Adding a widget calls `api.addPanel(...)`.
- Use a registry-defined default placement.
- Close via:
  - Close button
  - `Escape`
  - Clicking backdrop
- Focus is trapped inside the drawer while open.
- Return focus to the Add Widget button on close.

### 5.6 Remove widget

- Available through the overflow menu only for removable widgets.
- Required widgets cannot be removed.
- Removing a widget updates the serialized layout.
- Removed widgets become available again in the widget library.
- Removing is different from minimizing.

### 5.7 Customize, Save, Cancel, Reset

When entering Customize Layout:

```ts
editSnapshot = {
  layout: api.toJSON(),
  minimizedPanelIds,
};
```

- **Save layout**
  - Exit edit mode.
  - Persist the current layout.
  - Show a subtle “Layout saved” status.
- **Cancel**
  - Restore `editSnapshot` with `api.fromJSON(...)`.
  - Restore the prior minimized rail.
  - Do not persist.
- **Reset**
  - Load `DEFAULT_DASHBOARD_LAYOUT`.
  - Clear minimized widgets.
  - Persist only after explicit confirmation or after Reset is accepted.
- Avoid a browser confirm dialog. Use the existing FinOps dialog pattern.

---

## 6. Dockview integration

### Package

```bash
pnpm add dockview-react
```

Import Dockview styles once inside the Dashboard client boundary or global stylesheet:

```ts
import "dockview-react/dist/styles/dockview.css";
```

Do not ship the default Dockview appearance unchanged. Override it with FinOps design tokens.

### Client boundary

Dockview is interactive DOM UI. Keep the route page as a Server Component where possible and isolate Dockview in a Client Component.

Suggested boundary:

```text
Dashboard page (Server Component)
  └── loads user, permissions, account data and saved layout
      └── DashboardDockLayout.client.tsx
          └── DockviewReact
```

Use a dynamic import with `ssr: false` only if the installed Dockview version accesses browser globals during module evaluation.

The Dockview container must have an explicit usable height, for example:

```css
.dashboardDockRoot {
  height: calc(100dvh - var(--topbar-height) - var(--dashboard-header-height));
  min-height: 640px;
}
```

### Widget registry

Create one registry as the source of truth:

```ts
export type DashboardWidgetId =
  | "account-overview"
  | "equity-curve"
  | "watchlist"
  | "top-holdings"
  | "market-heatmap"
  | "order-activity"
  | "news-events"
  | "performance-snapshot";

export type DashboardWidgetDefinition = {
  id: DashboardWidgetId;
  title: string;
  description: string;
  component: string;
  required: boolean;
  removable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  minWidth: number;
  minHeight: number;
  defaultPosition: DashboardWidgetPosition;
  requiredRoles?: Array<"VIEWER" | "TRADER" | "ADMIN">;
};
```

Do not place JSX components, mutable API objects, functions, market data, or user objects inside persisted layout JSON.

### Component registration

Use a stable map:

```ts
const components = {
  accountOverview: AccountOverviewWidget,
  equityCurve: EquityCurveWidget,
  watchlist: WatchlistWidget,
  topHoldings: TopHoldingsWidget,
  marketHeatmap: MarketHeatmapWidget,
  orderActivity: OrderActivityWidget,
  newsEvents: NewsEventsWidget,
  performanceSnapshot: PerformanceSnapshotWidget,
};
```

Each Dockview panel receives only serializable parameters such as:

```ts
{
  widgetId: "watchlist",
}
```

The widget component should obtain current data from existing props, queries, context, or stores. Layout state must not become a second business-data store.

---

## 7. Suggested code structure

Adapt names to the existing repository instead of creating duplicate architecture.

```text
src/
├── features/dashboard/
│   ├── components/
│   │   ├── DashboardDockLayout.client.tsx
│   │   ├── DashboardDockHeader.tsx
│   │   ├── DashboardLayoutToolbar.tsx
│   │   ├── AddWidgetDrawer.tsx
│   │   ├── MinimizedWidgetRail.tsx
│   │   └── ResetDashboardLayoutDialog.tsx
│   ├── widgets/
│   │   ├── AccountOverviewWidget.tsx
│   │   ├── EquityCurveWidget.tsx
│   │   ├── WatchlistWidget.tsx
│   │   ├── TopHoldingsWidget.tsx
│   │   ├── MarketHeatmapWidget.tsx
│   │   ├── OrderActivityWidget.tsx
│   │   ├── NewsEventsWidget.tsx
│   │   └── PerformanceSnapshotWidget.tsx
│   ├── dock/
│   │   ├── dashboard-widget-registry.ts
│   │   ├── dashboard-default-layout.ts
│   │   ├── dashboard-layout.types.ts
│   │   ├── dashboard-layout.persistence.ts
│   │   └── dashboard-layout.validation.ts
│   └── tests/
│
├── app/actions/
│   └── dashboard-layout.ts
│
└── db/schema/
    └── dashboard-layouts.ts
```

Before adding files, inspect the existing structure and place code in the nearest existing feature folders.

---

## 8. Drizzle persistence

Persist layouts per user in PostgreSQL through Drizzle. Do not rely only on `localStorage`.

### Suggested table

```ts
export const dashboardLayouts = pgTable(
  "dashboard_layouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    layoutKey: text("layout_key")
      .notNull()
      .default("main"),

    layoutJson: jsonb("layout_json")
      .notNull(),

    minimizedPanelIds: jsonb("minimized_panel_ids")
      .$type<string[]>()
      .notNull()
      .default([]),

    schemaVersion: integer("schema_version")
      .notNull()
      .default(1),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("dashboard_layouts_user_key_unique").on(
      table.userId,
      table.layoutKey,
    ),
  ],
);
```

Adapt the `users` reference and Drizzle callback syntax to the version already installed in the repository.

### Persistence envelope

```ts
export type DashboardLayoutPayload = {
  schemaVersion: 1;
  layoutKey: "main";
  dockview: Record<string, unknown>;
  minimizedPanelIds: DashboardWidgetId[];
};
```

Use the Dockview exported serialized-layout type when available in the installed package. Still validate the application envelope at runtime with Zod.

### Server operations

```ts
getDashboardLayout(userId, layoutKey)
saveDashboardLayout(userId, payload)
resetDashboardLayout(userId, layoutKey)
```

Use Server Actions for internal mutations.

Requirements:

- Derive `userId` from the authenticated session, never from untrusted form input.
- Upsert by `(userId, layoutKey)`.
- Enforce a maximum serialized payload size.
- Reject unknown widget IDs.
- Strip panels the current role cannot access.
- Create an audit entry for reset if the project already audits user settings.
- Do not audit every splitter movement.

### Save timing

- Listen to Dockview layout mutation/layout-change events.
- Debounce autosave by approximately 500–1000ms.
- Do not save during initial `fromJSON`.
- Do not save every pixel during a resize gesture.
- Explicit Save in edit mode flushes immediately.
- On server failure:
  - Keep the local in-memory layout.
  - Show a non-blocking error.
  - Allow retry.
- `localStorage` may be used as a temporary recovery cache, not the source of truth.

### Load timing

1. Server loads the user's layout.
2. Dashboard renders a skeleton until Dockview is ready.
3. Register panel components.
4. Call `api.fromJSON(savedLayout, { reuseExistingPanels: true })`.
5. If parsing/loading fails, load `DEFAULT_DASHBOARD_LAYOUT`.
6. Restore `minimizedPanelIds`.
7. Mark hydration complete.
8. Start listening for persistence events only after hydration.

---

## 9. Default layout versioning

Store a numeric `schemaVersion`.

When widget IDs or layout rules change:

```ts
function migrateDashboardLayout(
  payload: DashboardLayoutPayload,
): DashboardLayoutPayload
```

Migration rules:

- Remove unknown panel IDs.
- Add newly required panels.
- Rename deprecated IDs.
- Ensure required widgets exist exactly once.
- Fall back to default layout when migration cannot safely complete.
- Never break the Dashboard because a user has an old layout.

---

## 10. Styling

Map Dockview styling to existing CSS variables. Do not introduce a separate visual theme.

Example direction:

```css
.finopsDockview {
  --dv-background-color: var(--background-canvas);
  --dv-paneview-active-outline-color: var(--border-focus);
  --dv-tabs-and-actions-container-background-color: var(--background-raised);
  --dv-activegroup-visiblepanel-tab-background-color: var(--background-raised);
  --dv-inactivegroup-visiblepanel-tab-background-color: var(--background-surface);
  --dv-tab-divider-color: var(--border-default);
  --dv-separator-border: var(--border-strong);
}
```

Confirm the exact Dockview CSS variable names from the installed version before finalizing overrides.

Additional requirements:

- 36px custom dock header.
- FinOps accent outline only in edit mode, focused state, or active drop target.
- No bright default Dockview blue.
- Use existing icons if the project already has Lucide.
- Use tooltips for icon-only controls.
- The overflow menu must match existing FinOps menus/dialogs.

---

## 11. Responsive behavior

### Desktop

Enable Dockview when:

```text
viewport width >= 1024px
```

The exact breakpoint may be aligned with the project's existing desktop breakpoint.

### Mobile and narrow tablet

Do not render the desktop Dockview workspace at 390px.

Keep the existing mobile Dashboard:

- Fixed stacked widgets.
- Existing bottom navigation.
- No free docking.
- No narrow draggable splitters.
- Optional simple widget visibility/reorder can be a separate future feature.

Do not serialize a mobile stack into the desktop Dockview layout.

---

## 12. RBAC

Dashboard layout is personal UI preference.

- Viewer may customize their own Dashboard.
- Trader may customize their own Dashboard.
- Admin may customize their own Dashboard.
- A user cannot read or overwrite another user's layout.
- Do not make an Admin layout globally authoritative unless a separate feature is explicitly requested.
- Widgets with restricted data must be filtered through the registry before they are added or restored.

---

## 13. Accessibility

- Every icon-only control has an accessible name.
- Drag grip has a description such as `Move Equity curve widget`.
- Maximize/restore labels reflect current state.
- Minimize/restore labels reflect current state.
- Provide non-drag alternatives in the overflow menu:
  - Move left
  - Move right
  - Move above
  - Move below
  - Move to tab group
- `Escape` exits maximize and closes drawers/dialogs.
- Add Widget drawer traps focus and restores focus on close.
- Keyboard users can restore minimized widgets.
- Visible focus treatment uses the FinOps focus token.
- Do not communicate editable/drop state through color alone.

---

## 14. Performance requirements

- Do not recreate the Dockview API or panel registry on every render.
- Memoize the component map and callbacks where necessary.
- Keep realtime market updates outside layout state.
- Resizing a panel must not regenerate mock market data.
- Only the affected widget should react to its data changes.
- Avoid saving during every realtime data update.
- Avoid serializing chart data or table rows into `toJSON()`.
- Destroy all Dockview event subscriptions on unmount.
- No hydration warnings.
- No console errors after repeated add/remove/maximize/minimize cycles.

---

## 15. Error handling

Required fallbacks:

| Failure | Expected behavior |
|---|---|
| No saved layout | Load default |
| Invalid JSON | Log safely and load default |
| Unknown widget ID | Remove unknown widget and continue |
| Required panel missing | Reinsert required panel |
| Duplicate panel | Keep one instance |
| Save API fails | Keep current UI, show retry status |
| Restore target group missing | Restore at registry default position |
| Role no longer permits widget | Remove restricted widget |
| Dockview initialization fails | Render the existing fixed Dashboard |

The existing Dashboard must remain available as a fallback component until Dockview parity is verified.

---

## 16. Testing

### Unit tests

- Widget registry rejects duplicate IDs.
- Required widgets cannot be removed.
- Layout migration removes unknown IDs.
- Layout migration reinserts required panels.
- Zod payload validation rejects malformed envelopes.
- Role filtering removes restricted widgets.
- Default restore location is deterministic.

### Component/integration tests

- Default layout creates four installed panels.
- Add Widget prevents duplicate panel creation.
- Minimize removes panel from Dockview and adds rail item.
- Restore removes rail item and re-adds panel.
- Maximize and restore update the header action.
- Cancel restores the edit snapshot.
- Save calls persistence once with serialized layout.
- Reset loads the default layout.
- Loading a saved layout does not trigger an immediate redundant save.

### End-to-end tests

At a desktop viewport:

1. Open Dashboard.
2. Drag Watchlist to another group.
3. Resize Equity/Watchlist splitter.
4. Maximize Equity curve.
5. Restore Equity curve.
6. Minimize Watchlist.
7. Restore Watchlist.
8. Add Market heatmap.
9. Reload the page.
10. Verify the saved arrangement remains.
11. Reset layout.
12. Verify default arrangement.

At 390px:

- Existing mobile Dashboard remains visually unchanged.
- Dockview controls are not present.

Run:

```bash
pnpm lint
pnpm tsc --noEmit
pnpm test
pnpm build
```

Run the repository's existing E2E command if configured.

---

## 17. Acceptance criteria

The feature is complete only when:

- The implementation matches all five Figma states.
- Dashboard widgets can be dragged and docked.
- Splitters resize widget groups.
- Equity curve can be maximized and restored.
- Watchlist can be minimized into a rail and restored.
- Optional widgets can be added without duplication.
- Required widgets cannot be removed.
- Save, Cancel, and Reset behave as specified.
- Layout survives refresh and a new session through Drizzle persistence.
- Each user has an isolated layout.
- Existing business data, routes, charts, tables, and RBAC continue working.
- Existing mobile Dashboard is preserved.
- No default Dockview theme leaks into the FinOps UI.
- Lint, typecheck, tests, and production build pass.

---

## 18. CLI implementation prompt

Paste this into the CLI from the existing FinOps repository:

```text
Implement the FinOps customizable Dashboard specified in:

docs/finops-dockview-dashboard-spec.md

The current application UI and all Figma flows are already implemented.
Do not regenerate or redesign the application.

Figma source:
https://www.figma.com/design/m9MmphEJzKBmIiKrLSuR0W

Required Figma frames:
- Default: node 68:43
- Edit layout: node 68:253
- Maximized: node 68:489
- Minimized: node 68:699
- Add Widget drawer: node 68:905

Use Figma MCP to inspect each frame before changing code.

Use dockview-react for:
- drag and dock
- split-group resizing
- tab groups
- native maximize/restore
- layout serialization and restoration

Implement minimize as the custom minimized widget rail described in the
spec. Do not use edge-group collapse as if it were a generic minimize API.

Preserve:
- all current routes
- existing Server Components
- existing data-fetching and Drizzle logic
- current charts and tables
- existing FinOps design tokens
- Viewer, Trader, and Admin permissions
- existing mobile Dashboard
- Figma-matched desktop styling

Before coding:
1. Audit the current Dashboard implementation and project structure.
2. Locate existing design-system components and CSS variables.
3. Locate current auth/session and Drizzle schemas.
4. Write a short implementation plan in
   docs/dockview-dashboard-implementation-plan.md.
5. Do not create duplicate architecture.

Implementation requirements:
- Stable widget registry and panel IDs.
- Client-only Dockview boundary.
- Default layout matching Figma.
- Custom dock header matching Figma.
- Edit snapshot, Save, Cancel, and Reset.
- Add Widget drawer.
- Custom minimized rail.
- Drizzle persistence per authenticated user.
- Schema-versioned layout payload.
- Runtime validation.
- Error fallback to the current fixed Dashboard.
- Desktop-only docking; preserve mobile layout.
- Accessibility and keyboard alternatives.
- Unit, integration, and E2E coverage.

Implement in small checkpoints:
1. Registry, types, default layout, and fixed-dashboard fallback.
2. Dockview shell with the four existing widgets.
3. Drag, dock, resize, and custom headers.
4. Maximize and restore.
5. Minimize rail and restore.
6. Add/remove widget drawer.
7. Save, Cancel, Reset, and Drizzle persistence.
8. Responsive/mobile guard.
9. Tests and visual QA against Figma.

After each checkpoint run the relevant tests.
At completion run:
- pnpm lint
- pnpm tsc --noEmit
- pnpm test
- pnpm build

Do not mark the task complete while any command fails.
Document any unavoidable visual differences in:
docs/dockview-dashboard-qa.md
```
