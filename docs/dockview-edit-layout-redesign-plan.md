# Dockview Edit Layout Redesign Plan

Source of truth: Figma node `68:253` and `finops-dockview-dashboard-spec.md`.

## Scope guard

- Change only the desktop Dashboard edit-layout presentation and its bindings to real Dockview drag, target, direction, resize, and edit state.
- Preserve the normal Dashboard, mobile Dashboard, routes, widgets, data fetching, Drizzle persistence, serialization, restoration, RBAC, and fixed fallback.
- Reuse FinOps semantic color, spacing, radius, typography, focus, and elevation tokens.

## Current repository finding

The current `dashboard-hallmark` branch does not contain `dockview-react` or an existing Dockview client boundary, custom panel header, edit toolbar, drop overlay, drag preview, splitter overrides, or layout persistence. `app/dashboard/page.tsx` is still the fixed Server Component. Product code must not be changed until the branch or commit containing the existing Dockview feature is available; implementing that architecture here would violate the requested scope.

## Implementation checkpoints

1. Map the existing Dockview client, custom header, toolbar, overlays, preview, and CSS overrides without changing their ownership or behavior.
2. Consolidate edit actions into the right-aligned 48px raised toolbar; use the exact edit subtitle and preserve header clearance.
3. Replace global lime widget outlines with neutral borders; bind blue active-target and dashed reduced-opacity drag-source states to real Dockview state.
4. Render only the current drop direction. For the Figma state, place a roughly 170px `Dock right` target inside Equity curve; retain dynamic top/right/bottom/left/center support.
5. Replace the drag image with the 276 × 82px Watchlist ghost card and keep it conditional on an active drag.
6. Restyle active vertical and neutral horizontal splitters using FinOps info and strong-border tokens, with restrained hover/resize emphasis.
7. Replace the instruction banner with the bottom-left help pill and preserve Escape behavior and screen-reader direction text.
8. Verify desktop-only rendering, keyboard focus, accessible grip/action labels, no entry layout shift, and unchanged mobile/fixed Dashboard.

## QA

- Compare at 1440 × 1024 directly with Figma `68:253`.
- Exercise real drag source, changing drop directions, docking, tab grouping, splitter resize, save, cancel, reset, minimize/restore, maximize/restore, reload persistence, and all roles.
- Run `pnpm lint`, `pnpm tsc --noEmit`, `pnpm test`, `pnpm build`, and the repository E2E command if one exists.
- Record measured differences and command results in `docs/dockview-edit-layout-redesign-qa.md`.
