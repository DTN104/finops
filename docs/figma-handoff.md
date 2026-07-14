# FinOps Figma Handoff

## Source and scope

Source: Figma file `m9MmphEJzKBmIiKrLSuR0W`, inspected 2026-07-14. Pages read: `01 — Foundations` (`1:2`) through `12 — Prototype Map` (`1:13`). This document records authored values; unresolved implementation choices are called out rather than inferred.

## Canvases and responsive targets

| Target | Authored frame size | Evidence |
| --- | ---: | --- |
| Desktop application | 1440 × 1024 | Marketing, Authentication, Trading, Portfolio, Orders, Corporate Actions, Admin, Performance and prototype frames |
| Mobile application | 390 × 844 | All seven frames on `10 — Mobile` and mobile prototype frames |

Figma defines target widths, not CSS breakpoint thresholds. No tablet canvas or intermediate responsive specification exists. Treat `1440` and `390` as validation viewports; select breakpoint thresholds only after design confirmation.

## Figma variables to CSS variables

The CSS names below come from each variable's Figma `WEB` code syntax.

### Primitives (`FinOps Primitives`, mode `Value`)

| Figma | CSS | Value | Figma | CSS | Value |
| --- | --- | --- | --- | --- | --- |
| `navy/950` | `--finops-navy-950` | `#071019` | `navy/900` | `--finops-navy-900` | `#0b1622` |
| `navy/850` | `--finops-navy-850` | `#101d2b` | `navy/800` | `--finops-navy-800` | `#142435` |
| `navy/700` | `--finops-navy-700` | `#1c3147` | `slate/700` | `--finops-slate-700` | `#3e4b59` |
| `slate/600` | `--finops-slate-600` | `#536273` | `slate/500` | `--finops-slate-500` | `#718096` |
| `slate/400` | `--finops-slate-400` | `#98a6b6` | `slate/300` | `--finops-slate-300` | `#c3ccd6` |
| `slate/200` | `--finops-slate-200` | `#dde3ea` | `slate/100` | `--finops-slate-100` | `#f5f7fa` |
| `white` | `--finops-white` | `#ffffff` | `black` | `--finops-black` | `#000000` |
| `accent/600` | `--finops-accent-600` | `#afc300` | `accent/500` | `--finops-accent-500` | `#c9dd03` |
| `accent/100` | `--finops-accent-100` | `#f4f8c7` | `green/950` | `--finops-green-950` | `#071a10` |
| `green/500` | `--finops-green-500` | `#22c55e` | `green/100` | `--finops-green-100` | `#dcfce7` |
| `red/950` | `--finops-red-950` | `#2b0b0b` | `red/500` | `--finops-red-500` | `#ef4444` |
| `red/100` | `--finops-red-100` | `#fee2e2` | `amber/950` | `--finops-amber-950` | `#2b1a05` |
| `amber/500` | `--finops-amber-500` | `#f59e0b` | `amber/100` | `--finops-amber-100` | `#fef3c7` |
| `blue/950` | `--finops-blue-950` | `#071a2f` | `blue/500` | `--finops-blue-500` | `#3b82f6` |
| `blue/100` | `--finops-blue-100` | `#dbeafe` | `black/60` | `--finops-black-60` | `rgba(0, 0, 0, 0.6)` |

### Semantic colors (`FinOps Color`)

| Figma | CSS | Light | Dark |
| --- | --- | --- | --- |
| `bg/canvas` | `--finops-bg-canvas` | `--finops-white` | `--finops-navy-950` |
| `bg/surface` | `--finops-bg-surface` | `--finops-slate-100` | `--finops-navy-900` |
| `bg/surface-raised` | `--finops-bg-surface-raised` | `--finops-white` | `--finops-navy-850` |
| `bg/surface-subtle` | `--finops-bg-surface-subtle` | `--finops-slate-100` | `--finops-navy-800` |
| `bg/brand` | `--finops-bg-brand` | `--finops-accent-500` | `--finops-accent-500` |
| `bg/brand-hover` | `--finops-bg-brand-hover` | `--finops-accent-600` | `--finops-accent-600` |
| `bg/disabled` | `--finops-bg-disabled` | `--finops-slate-100` | `--finops-navy-800` |
| `text/primary` | `--finops-text-primary` | `--finops-navy-950` | `--finops-white` |
| `text/secondary` | `--finops-text-secondary` | `--finops-slate-600` | `--finops-slate-300` |
| `text/muted` | `--finops-text-muted` | `--finops-slate-500` | `--finops-slate-400` |
| `text/on-brand` | `--finops-text-on-brand` | `--finops-navy-950` | `--finops-navy-950` |
| `text/disabled` | `--finops-text-disabled` | `--finops-slate-400` | `--finops-slate-500` |
| `text/on-danger` | `--finops-text-on-danger` | `--finops-white` | `--finops-white` |
| `border/default` | `--finops-border-default` | `--finops-slate-200` | `--finops-navy-700` |
| `border/strong` | `--finops-border-strong` | `--finops-slate-300` | `--finops-slate-600` |
| `border/focus` | `--finops-border-focus` | `--finops-accent-500` | `--finops-accent-500` |
| `border/error` | `--finops-border-error` | `--finops-red-500` | `--finops-red-500` |
| `status/profit` | `--finops-status-profit` | `--finops-green-500` | `--finops-green-500` |
| `status/loss` | `--finops-status-loss` | `--finops-red-500` | `--finops-red-500` |
| `status/warning` | `--finops-status-warning` | `--finops-amber-500` | `--finops-amber-500` |
| `status/info` | `--finops-status-info` | `--finops-blue-500` | `--finops-blue-500` |
| `status/profit-bg` | `--finops-status-profit-bg` | `--finops-green-100` | `--finops-green-950` |
| `status/loss-bg` | `--finops-status-loss-bg` | `--finops-red-100` | `--finops-red-950` |
| `status/warning-bg` | `--finops-status-warning-bg` | `--finops-amber-100` | `--finops-amber-950` |
| `status/info-bg` | `--finops-status-info-bg` | `--finops-blue-100` | `--finops-blue-950` |
| `overlay/scrim` | `--finops-overlay-scrim` | `--finops-black-60` | `--finops-black-60` |

### Spacing and shape

Figma FLOAT values are expressed as CSS pixels here.

| Figma | CSS | Value | Figma | CSS | Value |
| --- | --- | ---: | --- | --- | ---: |
| `space/zero` | `--space-zero` | `0px` | `space/half` | `--space-half` | `2px` |
| `space/1` | `--space-1` | `4px` | `space/2` | `--space-2` | `8px` |
| `space/3` | `--space-3` | `12px` | `space/4` | `--space-4` | `16px` |
| `space/5` | `--space-5` | `20px` | `space/6` | `--space-6` | `24px` |
| `space/8` | `--space-8` | `32px` | `space/10` | `--space-10` | `40px` |
| `space/12` | `--space-12` | `48px` | `space/16` | `--space-16` | `64px` |
| `radius/none` | `--radius-none` | `0px` | `radius/xs` | `--radius-xs` | `4px` |
| `radius/sm` | `--radius-sm` | `8px` | `radius/md` | `--radius-md` | `12px` |
| `radius/lg` | `--radius-lg` | `16px` | `radius/xl` | `--radius-xl` | `24px` |
| `radius/full` | `--radius-full` | `9999px` |  |  |  |

### Typography variables

| Figma series | CSS mapping | Values |
| --- | --- | --- |
| `family/sans`, `family/mono` | `--font-sans`, `--font-mono` | `Inter`, `IBM Plex Mono` |
| `weight/regular`, `medium`, `semibold`, `bold` | `--font-regular`, `--font-medium`, `--font-semibold`, `--font-bold` | `Regular`, `Medium`, `Semi Bold`, `Bold` |
| `size/11`, `12`, `13`, `14`, `16`, `18`, `20`, `24`, `32`, `40`, `56` | `--font-size-{n}` | matching `{n}px` |
| `line/16`, `18`, `20`, `22`, `24`, `28`, `32`, `40`, `48`, `64` | `--line-{n}` | matching `{n}px` |

The weight variables contain Figma style names, not numeric CSS weights. Numeric CSS values are not specified.

## Typography styles

| Style | Font | Size / line | Weight | Letter spacing |
| --- | --- | --- | --- | ---: |
| `FinOps/Display/XL` | Inter | 56 / 64 | Bold | 0px |
| `FinOps/Display/L` | Inter | 40 / 48 | Bold | 0px |
| `FinOps/Heading/H1` | Inter | 32 / 40 | Bold | 0px |
| `FinOps/Heading/H2` | Inter | 24 / 32 | Semi Bold | 0px |
| `FinOps/Heading/H3` | Inter | 20 / 28 | Semi Bold | 0px |
| `FinOps/Body/L` | Inter | 16 / 24 | Regular | 0px |
| `FinOps/Body/M` | Inter | 14 / 22 | Regular | 0px |
| `FinOps/Body/S` | Inter | 13 / 20 | Regular | 0px |
| `FinOps/Label/L` | Inter | 14 / 20 | Medium | 0px |
| `FinOps/Label/M` | Inter | 12 / 18 | Medium | 0.2px |
| `FinOps/Data/L` | IBM Plex Mono | 18 / 24 | Medium | 0px |
| `FinOps/Data/M` | IBM Plex Mono | 14 / 20 | Medium | 0px |
| `FinOps/Data/S` | IBM Plex Mono | 12 / 18 | Regular | 0px |

All styles use original case, no decoration and zero paragraph spacing. Financial values, quotes and tabular data use IBM Plex Mono.

## Effects

- `FinOps/Elevation/SM`: `0 2px 8px rgba(0,0,0,0.18)`.
- `FinOps/Elevation/MD`: `0 8px 24px -4px rgba(0,0,0,0.24)`.
- `FinOps/Focus/Accent`: 3px spread, no blur, `rgba(201,221,3,0.35)`.

## Design details requiring confirmation

- CSS breakpoint thresholds and tablet behavior are absent; only 1440px and 390px targets exist.
- URL paths are absent except the illustrative 404 value `/portfolio/missing`.
- Figma architecture labels modules as `src/...`, while this repository currently uses a root `app/` directory.
- Font-weight variables are strings (`Semi Bold`) rather than CSS numeric weights.
- Light and dark variables are defined, but most product screens show one authored appearance; theme-switch behavior is not prototyped.
