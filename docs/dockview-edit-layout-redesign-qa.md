# Dockview Edit Layout Redesign QA

Date: 16 July 2026  
Figma reference: node `68:253` at 1440 × 1024

## Result

- `dockview-react@7.0.2` is installed and the desktop Dashboard uses live Dockview panels; the fixed Dashboard remains the mobile fallback.
- The edit toolbar is 48px high, right aligned with a 32px viewport inset, and does not overlap the title or subtitle.
- Normal panels use neutral borders. A real Watchlist drag measured opacity `0.42` with a dashed neutral border.
- A real drag over the Equity curve rendered exactly one active target: `Dock right`, measured at 170px wide.
- The active target uses a blue panel border and lime only for the dashed drop target and its label.
- The drag image CSS is 276 × 82px; help text is the compact bottom-left pill from Figma.
- The workspace measured 1144 × 824px with no document scroll or horizontal overflow.
- Save returned `Layout saved`; reload restored all four serialized panels from per-user Drizzle settings.
- At 390 × 844, Dockview and edit controls both measured hidden, the fixed mobile Dashboard remained visible, and there was no horizontal overflow.

## Commands

- `pnpm lint` — passed.
- `pnpm tsc --noEmit` — passed.
- `pnpm test` — passed, 22 tests.
- `pnpm build` — passed, production compilation and all 16 generated pages.
- No Playwright, Cypress, or other repository E2E command is configured.

## Remaining differences

- Dockview targets and the drag ghost are intentionally absent until a real drag begins; the Figma frame captures that active interaction state.
- Chrome headless surface capture produced black compositor tiles after toggling edit mode. DOM hit-testing at three panel locations confirmed the correct visible elements, backgrounds, and opacity; normal-state screenshots and all geometric/interaction measurements were valid.
