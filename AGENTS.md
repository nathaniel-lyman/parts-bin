# AGENTS.md

Guidance for coding agents working in this repository.

## What This Is

"Ledger" is a Vite + React + TypeScript dashboard and clone-and-customize theme starter. The design system is isolated in `src/theme/`; `demo.html` is the behavior reference, `THEME-SPEC.md` is the canonical design reference, and implementation plans live in `docs/superpowers/`.

## Commands

```bash
npm run dev            # Vite dev server at http://localhost:5173
npm run build          # tsc -b && vite build; use this for real type-checking
npm test               # Vitest, single run
npm run test:watch     # Vitest watch mode
npm run lint           # ESLint
npm run lint:theme     # fails if raw colors appear outside src/theme/
```

Run one test file with `npx vitest run <path>` and one test by name with `npx vitest run -t "<name>"`.

## Theme Boundary

- No raw colors (`#hex`, `rgb()`, `hsl()`) outside `src/theme/`.
- Components should use token-backed Tailwind utilities such as `bg-surface`, `bg-surface-2`, `text-ink`, `text-muted`, `text-faint`, `border-line`, `text-accent`, `text-pos`, `text-neg`, `text-warn`, and helpers like `.num`, `.micro`, `.display`, `.shadow-modal`, `.shadow-dropdown`.
- Avoid adding named Tailwind color utilities outside the existing sanctioned patterns, even if `lint:theme` would not catch them.
- Before claiming UI work done, run `npm run lint:theme` plus `npm run build`.

## Data Flow

`useAccounts` is the CRUD source of truth. KPIs and charts derive from its list, and `DataGrid` is the account-table surface.

```text
data/accounts.ts -> useAccounts -> selectors/metrics -> KpiCard x4 + MrrShareDonut
                         |                            -> DataGrid
                         -> create/edit/delete from AccountFormModal + ConfirmDialog
```

- `selectors/metrics.ts` intentionally excludes `Churned` from `totalMrr`, `avgGrowth`, and `segmentShares`; `activeCount` counts only `Active`; `atRiskCount` counts non-`Active`.
- `avgGrowth` intentionally matches `demo.html`; verify against the demo before changing it.
- Persistence ownership:
  - `useTheme` writes `ledger.theme`.
  - `theme/recipes.ts` writes `ledger.theme.recipe`.
  - `useGridPersistence` writes `ledger.accounts.grid`.
  - `useSavedViews` writes `ledger.accounts.grid.views`.
  - Legacy `ledger.cols` and `ledger.colOrder` are read only by DataGrid migration code.

## DataGrid UI Rules

- Header cells should show vertical separators between columns.
- Header controls are progressive disclosure: sort indicators, column menu triggers, and resize handles stay hidden until the header is hovered or focused.
- Column menu triggers use a vertical ellipsis (`⋮`), not horizontal dots.
- Do not show a separate grab-target icon in headers. The header cell itself is the drag/sort affordance and should show a pointer cursor on hover when interactive.
- The inline per-column filter row is hidden by default. Show it only through the toolbar `Filters` toggle.
- Column menus must stay inside the viewport on narrow layouts. They use fixed positioning with clamped coordinates; do not revert them to absolutely positioned children of the scroll container.
- Keep row and column controls accessible by keyboard/focus, not only mouse hover.

## Gotchas

- Node 25 can shadow jsdom `localStorage`; `src/test-setup.ts` installs the in-memory `Storage` polyfill. Do not remove it.
- `tsconfig` has `noUnusedLocals`, so Vitest green does not guarantee build green.
- Recharts v3 tooltip formatter values should be coerced with `Number(v)` before formatting.

## Verification

For behavior changes, run the smallest relevant test first, then the broader gates appropriate to the change. For frontend/UI changes, use the running app or Playwright to verify the rendered behavior at the viewport where the issue was reported.

Minimum before handoff for most code changes:

```bash
npm run lint
npm run lint:theme
npm test
npm run build
```

For layout-sensitive DataGrid changes, also run focused Playwright or a browser measurement against `http://127.0.0.1:5173/`.
