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
  chart styling). This is the swappable, portable layer. See `src/theme/RETHEME.md`.
- **`src/components/`** — hand-rolled, token-only components (KPI cards, data table with
  sort/filter/columns, charts, forms, toasts). No raw colors; enforced by `npm run lint:theme`.
- **`src/hooks/`, `src/selectors/`, `src/data/`** — client-side state, derived metrics, seed data.
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
2. Copy the components you want from `src/components/`.
3. Run `npm run lint:theme` (copy `scripts/lint-theme.mjs`) to keep the boundary honest.

## Tech
Vite · React · TypeScript · Tailwind CSS v4 · Recharts · TanStack Table · Vitest
