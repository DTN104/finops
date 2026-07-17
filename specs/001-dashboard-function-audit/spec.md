# Feature Specification: Dashboard Function Completeness

**Feature Branch**: `001-dashboard-function-audit`  
**Created**: 2026-07-17  
**Status**: Ready for Planning  
**Input**: "Check the current Dashboard and identify the missing functions needed for a complete Dashboard experience, with emphasis on the customizable widget workspace."

## Current-State Audit

The current Dashboard already has a strong functional base. This specification preserves that base and defines only the gaps that should be closed.

| Capability | Current assessment | Gap to close |
| --- | --- | --- |
| Authenticated portfolio summary and four core widgets | Present | Preserve existing data and calculations |
| Drag, dock, tab grouping, and tab activation | Present | Add a non-pointer way to move widgets |
| Resize in Customize mode | Partial | Enforce usable minimum widget sizes |
| Maximize and restore | Present | Restore with `Escape` and keep labels/state accurate |
| Close and reopen a widget | Partial | Make persistence behavior explicit and restore near the prior position |
| Save, Cancel, and Reset | Partial | Confirm Reset and remove ambiguity around changes made outside Customize mode |
| Per-user saved layout | Partial | Recover consistently from old, invalid, duplicate, or incomplete layouts |
| Mobile fixed Dashboard | Partial | Do not initialize the desktop workspace on a narrow viewport |
| Light and dark themes | Missing for the customizable workspace | Make every Dashboard surface follow the selected theme |
| Data freshness status | Misleading | Do not claim live 500 ms updates when the Dashboard is showing a snapshot |
| Loading and failure states | Missing | Provide loading, retry, and fixed-Dashboard fallback states |
| Widget keyboard accessibility | Partial | Make move, restore, close, maximize, and tab activation keyboard operable |
| Dashboard behavior coverage | Missing | Verify the main workspace flows, not only fixture data |

The prior Dashboard draft also describes four speculative optional widgets. They are intentionally deferred here because the repository has no distinct approved product behavior or data contract for them. The widget picker in this scope manages registered widgets that the user has hidden; it must not invent new market data or external integrations.

## User Scenarios & Testing

### User Story 1 - Trust the Dashboard in either theme and viewport (Priority: P1)

As an authenticated user, I can open the Dashboard and immediately understand what data I am seeing, while the page correctly follows my selected theme and device layout.

**Why this priority**: Incorrect theme colors and false live-status messaging undermine trust in a financial product before the user interacts with any customization feature.

**Independent Test**: Open the Dashboard in light and dark themes at desktop and 390 px widths, then verify the visual theme, freshness label, navigation, and available controls without modifying a layout.

**Acceptance Scenarios**:

1. **Given** the selected theme is light, **When** the user opens the Dashboard, **Then** all widget backgrounds, headers, text, dividers, menus, and workspace states use the light theme with readable contrast and no dark-theme chrome.
2. **Given** the selected theme is dark, **When** the user opens the Dashboard, **Then** the existing dark visual treatment remains consistent and readable.
3. **Given** the Dashboard is showing a server-loaded simulated snapshot, **When** the header and chart captions render, **Then** they identify the data as a simulated snapshot and do not claim `LIVE` or a 500 ms update cadence.
4. **Given** a supported market symbol is shown in the watchlist, **When** the user activates the symbol, **Then** the corresponding stock detail opens just as it does in the fixed Dashboard.
5. **Given** the viewport is narrower than the desktop breakpoint, **When** the Dashboard loads, **Then** the fixed mobile Dashboard is used and desktop layout controls are neither visible nor initialized.

---

### User Story 2 - Customize and safely persist the workspace (Priority: P1)

As a user, I can arrange, resize, group, maximize, close, and reopen widgets, and I always know whether those changes have been saved.

**Why this priority**: Workspace customization is the defining Dashboard function, and ambiguous save behavior can make a user lose a carefully arranged layout.

**Independent Test**: Customize all four core widgets, save, reload, cancel a second set of changes, close and reopen a widget, and reset after confirmation.

**Acceptance Scenarios**:

1. **Given** the user enters Customize mode, **When** they drag a widget by its dedicated move control, **Then** they can dock it above, below, left, right, or into a tab group without interfering with links, chart hover, table scrolling, or text selection.
2. **Given** two widget groups share a divider, **When** the user resizes them in Customize mode, **Then** both respond smoothly and neither becomes smaller than its usable content minimum.
3. **Given** a group contains multiple tabs, **When** the user activates any tab name, **Then** that tab becomes active without requiring the move control.
4. **Given** a widget is not maximized, **When** the user selects Maximize, **Then** only the Dashboard workspace is enlarged and the action changes to Restore.
5. **Given** a widget is maximized, **When** the user selects Restore, selects the same action again, or presses `Escape`, **Then** the prior workspace arrangement returns.
6. **Given** a widget is visible, **When** the user closes it, **Then** it leaves the current workspace without deleting its definition or business data and appears in the hidden-widget picker.
7. **Given** a widget is hidden, **When** the user restores it, **Then** it returns once, preferably near its previous location, and disappears from the hidden-widget picker.
8. **Given** the user saves a customized layout, **When** the page is reloaded or a new session begins, **Then** the same visible widgets, tab groups, sizes, and arrangement are restored for that user only.
9. **Given** the user cancels Customize mode, **When** unsaved changes exist, **Then** the exact layout and hidden-widget state from the start of that edit session return.
10. **Given** the user selects Reset, **When** they have not yet confirmed, **Then** the current layout remains unchanged; **When** they confirm and save, **Then** the default four-widget layout becomes their persisted layout.
11. **Given** a layout-changing action is available outside Customize mode, **When** the user performs it, **Then** the interface either persists it automatically with feedback or clearly marks it as unsaved and offers an immediate Save action; no change may be silently lost.

---

### User Story 3 - Recover from layout and service failures (Priority: P1)

As a user, I can still use the Dashboard when my saved layout is absent, outdated, invalid, or cannot be saved.

**Why this priority**: A personal UI preference must never prevent access to portfolio information.

**Independent Test**: Load the Dashboard with no saved layout, malformed layout data, an outdated layout, and a failed save response, then simulate a customizable-workspace initialization failure.

**Acceptance Scenarios**:

1. **Given** no saved layout exists, **When** the Dashboard loads, **Then** the default four-widget layout is shown.
2. **Given** the saved layout contains unknown or duplicate widgets, or omits a required widget, **When** the Dashboard loads, **Then** unsupported entries are removed, duplicates are collapsed, required widgets are restored once, and the Dashboard remains usable.
3. **Given** the saved layout and hidden-widget list disagree or cannot be safely interpreted, **When** recovery occurs, **Then** both are reset to one internally consistent default state.
4. **Given** the customizable workspace cannot initialize, **When** the Dashboard renders, **Then** the existing fixed Dashboard is shown instead of a blank or broken page.
5. **Given** the layout is still loading, **When** the user opens the Dashboard, **Then** a stable loading presentation reserves the content area until a usable Dashboard is ready.
6. **Given** a save request fails, **When** the failure is returned, **Then** the current in-memory layout remains visible, an accessible error explains that it was not saved, and the user can retry.
7. **Given** the session expires while saving, **When** the save fails, **Then** the user receives a session-specific message and the Dashboard does not falsely report success.

---

### User Story 4 - Operate the workspace without precise pointer dragging (Priority: P2)

As a keyboard user, I can activate tabs and perform every essential widget action without relying on drag-and-drop.

**Why this priority**: The current focusable move control does not itself provide a keyboard move operation, leaving the main customization flow incomplete for keyboard users.

**Independent Test**: Starting with keyboard input only, activate a grouped tab, move a widget in every supported direction, maximize and restore it, close and reopen it, and save the layout.

**Acceptance Scenarios**:

1. **Given** Customize mode is active, **When** focus reaches a widget's move control, **Then** instructions and explicit move choices are available for left, right, above, below, and tab grouping.
2. **Given** a move choice cannot be applied at the current location, **When** the user encounters it, **Then** it is disabled or explained rather than silently doing nothing.
3. **Given** focus is on a tab name, **When** the user activates it, **Then** the tab becomes active and focus remains predictable.
4. **Given** a widget is hidden, **When** a keyboard user opens the hidden-widget picker and restores it, **Then** focus returns to a sensible control in the restored workspace.
5. **Given** a modal confirmation or picker is open, **When** the user presses `Escape`, **Then** the topmost transient interface closes and focus returns to its trigger.

## Edge Cases

- The user closes the currently active tab in a multi-tab group.
- The user closes or restores a widget while another group is maximized.
- The prior restore target no longer exists because groups were moved or merged.
- A widget is already visible when a duplicate restore action is received.
- The viewport crosses the desktop breakpoint while the Dashboard is open.
- The theme changes while a menu, drop target, or maximized widget is visible.
- The user starts a drag or resize, then navigates away or cancels editing.
- The save response arrives after the user has made a newer local change.
- The user's saved layout was created by an older Dashboard version.
- Portfolio data contains no positions, no watchlist rows, or no open orders.

## Requirements

### Functional Requirements

- **FR-001**: The Dashboard MUST preserve the authenticated portfolio calculations, routes, four core widgets, and role access already available.
- **FR-002**: Every Dashboard surface and interaction state MUST follow the user's active light or dark theme, including widget chrome, separators, menus, drag previews, drop targets, and focus indicators.
- **FR-003**: The Dashboard MUST describe data freshness truthfully. A snapshot MUST NOT be labeled live or assigned a refresh cadence that is not occurring.
- **FR-004**: The current release MUST identify Dashboard market values as simulated snapshot data with an accurate as-of value; a realtime Dashboard feed is not required by this scope.
- **FR-005**: Supported watchlist symbols MUST retain their available navigation to stock detail from both fixed and customizable Dashboard presentations.
- **FR-006**: The customizable workspace MUST be available only at the established desktop breakpoint, while narrower viewports use the fixed mobile Dashboard without initializing desktop workspace behavior.
- **FR-007**: The user MUST be able to enter and leave a clearly indicated Customize mode.
- **FR-008**: Customize mode MUST support pointer-based docking above, below, left, right, and into a tab group from a dedicated move control.
- **FR-009**: Activating a tab name MUST make that tab active independently of the move control.
- **FR-010**: Customize mode MUST support horizontal and vertical resizing while preserving a usable minimum size for each widget's content.
- **FR-011**: The user MUST be able to maximize one Dashboard group at a time and restore it through the action control or `Escape`, without hiding the application shell.
- **FR-012**: The maximize/restore control MUST always expose the action that will happen next through its icon, accessible name, and visible state.
- **FR-013**: Closing a widget MUST hide it from the current workspace without deleting its definition or business data.
- **FR-014**: Hidden widgets MUST be discoverable and keyboard-restorable from a dedicated picker, and the picker MUST prevent duplicate widget instances.
- **FR-015**: Restoring a widget SHOULD use its last useful position; if that position no longer exists, the widget MUST use a deterministic default position.
- **FR-016**: Every layout-changing action MUST have explicit persistence semantics: it is either part of a pending Customize session or is saved automatically with visible status.
- **FR-017**: Save MUST persist the visible widgets, hidden widget IDs, group arrangement, tab grouping, and sizes for the authenticated user only.
- **FR-018**: Cancel MUST restore the exact layout and hidden-widget state captured when the current Customize session began.
- **FR-019**: Reset MUST require an in-product confirmation and MUST restore the approved four-widget default only after acceptance.
- **FR-020**: A failed save MUST retain the local layout, report that persistence failed, and allow retry without requiring the user to recreate changes.
- **FR-021**: Loading the Dashboard MUST show a stable loading presentation until either the customizable workspace or fixed fallback is ready.
- **FR-022**: Missing, malformed, outdated, duplicated, incomplete, or unauthorized saved layout entries MUST be normalized or replaced without making the Dashboard unavailable.
- **FR-023**: Layout recovery MUST keep the visible layout and hidden-widget list internally consistent.
- **FR-024**: If the customizable workspace cannot initialize, the Dashboard MUST render the existing fixed presentation with the same business data.
- **FR-025**: All essential widget actions MUST be keyboard operable, including tab activation, directional movement, tab grouping, maximize/restore, close, reopen, save, cancel, and reset.
- **FR-026**: Transient interfaces MUST manage focus, close with `Escape` where expected, and return focus to their trigger.
- **FR-027**: Profit and loss values MUST retain non-color text alternatives in every Dashboard presentation.
- **FR-028**: Empty portfolio, watchlist, and order states MUST show a purposeful empty state rather than blank space or malformed widgets.
- **FR-029**: Repeated close, reopen, group, maximize, restore, resize, and theme-change cycles MUST not create duplicate reactions, duplicate widgets, or user-visible errors.
- **FR-030**: The hidden-widget picker MUST expose only registered, permitted widgets; speculative widgets and external market integrations are excluded until separately specified.

### Key Entities

- **Dashboard Workspace**: The user's desktop arrangement of visible widget groups, tab relationships, sizes, and maximized state.
- **Dashboard Widget**: A registered portfolio or market presentation with a stable identity, title, allowed actions, minimum usable size, and deterministic default position.
- **Hidden Widget Preference**: A stable list of widgets temporarily removed from the workspace but available to restore.
- **Layout Preference**: A versioned, per-user preference containing the workspace arrangement and hidden-widget state, but no portfolio or quote data.
- **Edit Snapshot**: The layout and hidden-widget state captured at the start of a Customize session for Cancel behavior.
- **Data Freshness State**: The user-facing indication that Dashboard values are a simulated snapshot and the time or business date they represent.

## Assumptions

- The existing four core widgets remain the approved default Dashboard content.
- “Close” means temporarily hide and make available to restore; it does not delete business data or permanently unregister the widget.
- Viewer, Trader, and Admin users may customize only their own layout.
- The established desktop breakpoint remains 1024 px unless a later responsive design decision changes it.
- The existing fixed mobile Dashboard is the fallback presentation and remains visually unchanged by this feature.
- No external realtime or news API will be introduced. Until a separate realtime Dashboard flow is specified, snapshot labeling is the correct product behavior.
- Existing application-level theme, focus, empty-state, error-state, loading, confirmation, and financial formatting patterns remain the source of truth.

## Out of Scope

- Free docking or splitter resizing on mobile.
- Shared team layouts or an administrator-controlled global layout.
- Live exchange connectivity or a new realtime Dashboard data pipeline.
- New optional widgets without approved behavior and existing data sources.
- Changes to portfolio calculations, order processing, authentication, or RBAC rules.
- Redesigning the application shell or replacing the current mobile Dashboard.

## Success Criteria

### Measurable Outcomes

- **SC-001**: In light- and dark-theme visual checks, 100% of Dashboard widget surfaces and transient states use the selected theme with no opposite-theme workspace chrome.
- **SC-002**: At 390 px, 100% of core Dashboard information remains available through the fixed mobile presentation and no desktop customization control or workspace initialization is observed.
- **SC-003**: A user can complete drag, group, resize, maximize, restore, close, reopen, save, cancel, and confirmed reset flows, and every saved result is reproduced after reload.
- **SC-004**: A keyboard-only user can complete all essential widget actions described in FR-025 without pointer dragging.
- **SC-005**: For absent, malformed, outdated, duplicate, incomplete, and initialization-failure cases, the Dashboard reaches a usable default or fixed fallback in every test case rather than presenting a blank workspace.
- **SC-006**: Every save failure test preserves the visible local arrangement, announces failure accessibly, and offers a successful retry path.
- **SC-007**: The Dashboard displays no `LIVE` or 500 ms claim while its values are server-loaded snapshots, and the visible as-of value matches the provided snapshot context.
- **SC-008**: Twenty consecutive cycles of close/reopen, maximize/restore, tab activation, and theme switching complete without duplicate widgets, duplicate action responses, console errors, or layout corruption.
- **SC-009**: Automated coverage exercises layout validation/recovery and the primary Customize, persistence, responsive, theme, and keyboard scenarios; all existing lint, test, and production build checks continue to pass.

