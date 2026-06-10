# Ledger — a swappable dashboard theme (React + Tailwind v4)

[![CI](https://github.com/nathaniel-lyman/dashboard-theme/actions/workflows/ci.yml/badge.svg)](https://github.com/nathaniel-lyman/dashboard-theme/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A runnable dashboard starter implementing the **Ledger** design system: sharp, technical,
data-first. Clone it, run it, customize it — or lift the `src/theme/` folder into your own app.

**[Live demo →](https://nathaniel-lyman.github.io/dashboard-theme/)** · explore `/docs`, `/login`, and `/settings` in the running app.

![Ledger dashboard, dark mode](docs/screenshots/dashboard-dark.png)

**The whole skin lives in one folder.** Change `src/theme/tokens.css` (or apply a shipped
recipe) and every component, chart, and page re-skins — zero component edits, enforced by lint:

| Ledger default | `ops-green` recipe — same app, one folder changed |
|---|---|
| ![Default theme](docs/screenshots/dashboard-dark.png) | ![Ops green recipe](docs/screenshots/dashboard-ops-green.png) |

## Quickstart
```bash
npm install
npm run dev
```

Starting a new project from this repo? Use GitHub's **"Use this template"** button (or clone and
delete `.git`) so you begin with a clean history.

## Pages out of the box

Every surface a dashboard product needs, already built from the kit's own primitives:

| | |
|---|---|
| ![Sign-in page](docs/screenshots/login-light.png) **`/login`** — split brand-panel sign-in | ![Settings page](docs/screenshots/settings-dark.png) **`/settings`** — appearance, profile, notifications |
| ![Component catalog](docs/screenshots/components-light.png) **`/docs`** — live catalog of ~99 components | ![Dashboard light](docs/screenshots/dashboard-light.png) **`/`** — KPI + charts + data grid, light mode |

## What's inside
- **`src/theme/`** — the entire design system (tokens, fonts, base styles, Tailwind mapping,
  chart styling, and optional theme recipes). This is the swappable, portable layer.
  See `src/theme/RETHEME.md`.
- **`src/components/ui/`** — hand-rolled, token-only primitives exported from
  `src/components/ui`: buttons (with loading state), icon buttons, forms, comboboxes, radio groups,
  tabs, segmented controls, overlays (modal + drawer), inline alerts, cards, metrics,
  empty/loading states, spinners, pagination, and toasts.
- **`src/components/shell/`** — clone-ready app structure: app shell, sidebar, top nav,
  breadcrumbs, filter bars, section headers, and settings panels.
- **`src/components/`** — dashboard components (KPI cards, data table with sort/filter/columns,
  charts, forms). No raw colors; enforced by `npm run lint:theme`.
- **`src/components/templates/`** — full-page starters you can route to directly: a dashboard,
  two workflow consoles, plus a split brand-panel **Login** (`/login`) and a section-scroll
  **Settings** (`/settings`) page. The starter pages are presentational demos — Settings'
  Appearance section is the live home for color mode, theme recipe, and density.
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
Copy-paste checklist (clone what you need, in order):
- [ ] **Theme** — copy `src/theme/` and import `theme/theme.css` at your root. Re-skin via `tokens.css` only.
- [ ] **Primitives** — copy `src/components/ui/`; import from the `ui` barrel (`Button`, `Field`, `Drawer`,
  `IconButton`, `InlineAlert`, `SegmentedControl`, modals, tabs, toasts, …).
- [ ] **Shell** — copy `src/components/shell/` for the app shell, sidebar, top nav, and filter bars.
- [ ] **Charts & DataGrid** *(optional)* — copy `src/components/charts/` and `src/components/DataGrid/`;
  import from the `charts` and `DataGrid` barrels.
- [ ] **Boundary** — copy `scripts/lint-theme.mjs` and wire `npm run lint:theme` so raw colors never leak
  outside `src/theme/`.
- [ ] **Reference** — see `src/theme/RETHEME.md` to re-skin and `THEME-SPEC.md` for the canonical design spec.

Every subsystem now has a barrel (`ui`, `shell`, `charts`, `DataGrid`), and `src/components` re-exports all
of them as one aggregate import root. Import from a barrel, not a deep file path:
```ts
import { Button, DataGrid, WaterfallChart, KpiCard } from './components'
```

Ledger is intentionally a copy-paste kit first, not an npm package. Let the public API harden
across real cloned apps before packaging it.

## Theme recipes
Open `/docs` to preview and apply `finance-cobalt`, `ops-green`, and `enterprise-neutral`.
Recipes live in `src/theme/recipes.css`; the helper API lives in `src/theme/recipes.ts`.
The default theme maps primary action, recommendation intelligence, success, review, and
reject/blocker states to `--accent`, `--intel`, `--pos`, `--warn`, and `--neg`.

## Tech
Vite · React · TypeScript · Tailwind CSS v4 · Recharts · TanStack Table · Vitest
