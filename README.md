# Ledger — a swappable dashboard theme (React + Tailwind v4)

A runnable dashboard starter implementing the **Ledger** design system: sharp, technical,
data-first. Clone it, run it, customize it — or lift the `src/theme/` folder into your own app.

## Quickstart
```bash
npm install
npm run dev
```

## What's inside
- **`src/theme/`** — the entire design system (tokens, fonts, base styles, Tailwind mapping,
  chart styling, and optional theme recipes). This is the swappable, portable layer.
  See `src/theme/RETHEME.md`.
- **`src/components/ui/`** — hand-rolled, token-only primitives exported from
  `src/components/ui`: buttons, forms, tabs, overlays, cards, metrics, empty/loading states,
  pagination, and toasts.
- **`src/components/shell/`** — clone-ready app structure: app shell, sidebar, top nav,
  breadcrumbs, filter bars, section headers, and settings panels.
- **`src/components/`** — dashboard components (KPI cards, data table with sort/filter/columns,
  charts, forms). No raw colors; enforced by `npm run lint:theme`.
- **`src/hooks/`, `src/selectors/`, `src/data/`** — client-side state, derived metrics, seed data.
- **`/docs`** — live component catalog with examples, prop guidance, and copy-paste usage snippets.
- **`THEME-SPEC.md`** — the canonical design reference.

## Scripts
| Command | Does |
|---|---|
| `npm run dev` | start the app |
| `npm run build` | typecheck + production build |
| `npm run test` | run the Vitest suite |
| `npm run lint:theme` | fail if raw colors leak outside `src/theme/` |

## Use Ledger in an existing app
1. Copy `src/theme/` into your project; import `theme/theme.css` at your root.
2. Copy `src/components/ui/` and `src/components/shell/`, then import from their barrel files.
3. Run `npm run lint:theme` (copy `scripts/lint-theme.mjs`) to keep the boundary honest.

Ledger is intentionally a copy-paste kit first, not an npm package. Let the public API harden
across real cloned apps before packaging it.

## Theme recipes
Open `/docs` to preview and apply `finance-cobalt`, `ops-green`, and `enterprise-neutral`.
Recipes live in `src/theme/recipes.css`; the helper API lives in `src/theme/recipes.ts`.
The default theme maps primary action, recommendation intelligence, success, review, and
reject/blocker states to `--accent`, `--intel`, `--pos`, `--warn`, and `--neg`.

## Tech
Vite · React · TypeScript · Tailwind CSS v4 · Recharts · TanStack Table · Vitest
