# parts-bin — React design system and component library

[![CI](https://github.com/nathaniel-lyman/parts-bin/actions/workflows/ci.yml/badge.svg)](https://github.com/nathaniel-lyman/parts-bin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A reusable React + TypeScript design system with token-only theming, UI primitives,
forms, overlays, feedback states, data display, DataGrid, charts, maps, shell/layout,
and chat primitives. The local Vite app exists to browse docs and examples.

**[Live demo →](https://nathaniel-lyman.github.io/parts-bin/)** · the root route opens the component catalog; then explore `/examples/dashboard`, `/examples/datagrid`, `/login`, and `/settings`.

![parts-bin component catalog](docs/screenshots/components-light.png)

**The whole skin lives in one folder.** Change `src/theme/tokens.css` and every component,
chart, and page re-skins — zero component edits, enforced by lint:

| parts-bin default | the same app after editing `src/theme/tokens.css` |
|---|---|
| ![Default theme](docs/screenshots/dashboard-dark.png) | ![Re-skinned via tokens.css](docs/screenshots/dashboard-ops-green.png) |

## Who is this for?

- **Product engineers** who need a copyable internal-app design system with a real public API.
- **Teams standardizing UI** across dashboards, admin tools, AI surfaces, and workflow apps.
- **Developers building examples fast** — the assembly demo, settings, and sign-in routes are proof surfaces built from the same components.

The assembly demo is intentionally demoted to example code. It demonstrates composition,
data derivation, and persistence, but it does not define the public component API.

## Quickstart
```bash
npm install
npm run dev
```

Starting a new project from this repo? Use GitHub's **"Use this template"** button (or clone and
delete `.git`) so you begin with a clean history.

**Primary surface: open [`/docs`](http://localhost:5173/docs).**
The docs catalog shows component purpose, imports, props, near-twin guidance, and snippets. Use
the assembly demo, sign-in, and settings screens only as examples after selecting components.

## Your first 30 minutes

The fastest path from clone to using the design system:

1. **Browse `/docs`** and pick components from the catalog rather than deep files.
2. **Copy the design-system layers** you need: `src/theme/`, `src/components/ui/`, `src/components/shell/`, `src/components/DataGrid/`, `src/components/charts/`, `src/components/maps/`, and `src/components/chat/`.
3. **Re-skin through tokens** in `src/theme/tokens.css`; do not hardcode colors in components.
4. **Use examples as references**: `/examples/dashboard` for a read-only component assembly, `/examples/datagrid` for the interactive grid harness, `/login` for a sign-in screen, and `/settings` for preferences.
5. **Verify to match the risk**: use focused component tests while iterating; before publishing package or public API changes, run `npm run lint`, `npm run lint:theme`, `npm run build`, and `npm test`.

Nothing in the framework is tied to the bundled sample dataset — map the generic parts to your domain:

| Sample assembly | Grocery store performance | Supplier scorecard |
|---|---|---|
| Record — title, owner | Store — number, district manager | Supplier — vendor, buyer |
| Value | Weekly net sales | On-time fill rate (%) |
| Category | Division or store format | Category: produce / dairy / dry goods |
| Status: Active / Review / Blocked | On-target / Below target / Remodel | Compliant / Watch / Suspended |
| Change % | Comp sales growth | Fill-rate trend |

For the optional sample assembly data swap, alternate domains exist as typechecked reference files —
[`src/data/examples/grocery-stores.ts`](src/data/examples/grocery-stores.ts) and
[`src/data/examples/supplier-scorecard.ts`](src/data/examples/supplier-scorecard.ts) — showing
the example's types, seed rows, and chart series remapped, plus the selector semantics you'd need
to decide. The mechanics of the swap — types, seed data, selectors, grid columns, in dependency
order — are written down in [`skills/swap-data-domain/SKILL.md`](skills/swap-data-domain/SKILL.md).

## Pages out of the box

The sample surfaces are built from the design system and live in the docs/examples app. Start at
**`/docs`** for the library reference:

| | |
|---|---|
| ![Component catalog](docs/screenshots/components-light.png) **`/` or `/docs`** — live gallery/reference for the public component API | ![Dashboard light](docs/screenshots/dashboard-light.png) **`/examples/dashboard`** — example KPI + charts + read-only table assembly |
| **`/examples/datagrid`** — interactive DataGrid harness with grouping, server mode, selection, CRUD, saved views, row pinning, editing, tree/detail rows, and export flows | ![Sign-in page](docs/screenshots/login-light.png) **`/login`** — example split brand-panel sign-in |
| ![Settings page](docs/screenshots/settings-dark.png) **`/settings`** — example appearance/profile/preferences page | |

## What's inside
- **`src/theme/`** — the entire design system (tokens, fonts, base styles, Tailwind mapping,
  chart styling, and optional theme recipes). This is the swappable, portable layer.
  See `src/theme/RETHEME.md`.
- **`src/components/ui/`** — hand-rolled, token-only primitives exported from
  `src/components/ui`: buttons (with loading state), icon buttons, forms, comboboxes, multi-selects,
  date controls, sliders, switches, tabs, segmented controls, overlays (modal, drawer, popover,
  dropdown/context menus, command palette), inline alerts, banners, cards, tables, metrics,
  activity/detail surfaces, loading states, spinners, pagination, and toasts.
- **`src/components/shell/`** — clone-ready app structure: app shell, sidebar, top nav,
  breadcrumbs, filter bars, section headers, and settings panels.
- **`src/components/DataGrid/`** — neutral, TanStack-backed grid with sorting, filtering,
  pagination, row selection, saved views, row pinning, range copy/paste, inline editing,
  grouping, built-in/custom aggregation, tree rows, detail panels, CSV/TSV export, and
  server-query helpers.
- **`src/components/`** — public design-system components and barrels: UI, shell, charts, maps,
  DataGrid, chat, KPI cards, sparkline, and confirm dialog. Demo-only example/template code is
  not exported from the aggregate component API.
- **`src/components/chat/`** — a composable assistant panel with markdown messages, prompt chips,
  streaming state, and a demo adapter that can read the current screen context.
- **`src/components/templates/`** — example full-page starters you can route to directly: a split brand-panel
  **Login** (`/login`) and a section-scroll **Settings** (`/settings`) page. The starter pages
  are presentational demos — Settings' Appearance section is the live home for color mode,
  theme recipe, and density.
- **`src/hooks/`, `src/selectors/`, `src/data/`** — client-side state, derived metrics, seed data.
- **`/docs`** — live component catalog with examples, prop guidance, and copy-paste usage snippets.
- **`skills/`** — agent skills: step-by-step workflows for re-theming, swapping the data domain,
  adding components, and verifying changes. See [Agent skills](#agent-skills).
- **`THEME-SPEC.md`** — the canonical design reference.

## Agent skills

The repo ships executable workflows for AI coding agents (Claude Code, Cursor, Codex, …), so the
happy path after cloning is: tell your agent *"re-skin this to my brand"*, then *"replace the demo
data with my domain"* — and it follows a checked-in, verified procedure instead of guessing.

| Skill | What your agent can do with it |
|---|---|
| [`retheme`](skills/retheme/SKILL.md) | Re-skin to a new brand — colors, dark mode, radii, fonts, chart palette |
| [`swap-data-domain`](skills/swap-data-domain/SKILL.md) | Optional example assembly workflow: replace the bundled sample data with another domain |
| [`add-component`](skills/add-component/SKILL.md) | Add UI the right way: catalog-first, token-only styling |
| [`verify-changes`](skills/verify-changes/SKILL.md) | Run the full done-checklist, including the failures tests alone miss |

Skills are plain markdown in the open Agent Skills format (`skills/<name>/SKILL.md`). Claude Code
picks them up automatically via `.claude/skills/`; other tools find them through
[AGENTS.md](AGENTS.md).

## Scripts
| Command | Does |
|---|---|
| `npm run dev` | start the app |
| `npm run preview` | serve the production build locally |
| `npm run build` | typecheck + production build |
| `npm run build:lib` | build the package entrypoints in `dist/` |
| `npm run test:package` | build and verify the `parts-bin/datagrid` subpath export |
| `npm test` | run the Vitest suite once |
| `npm run test:watch` | run Vitest in watch mode |
| `npm run lint` | run ESLint |
| `npm run lint:theme` | fail if raw colors leak outside `src/theme/` |
| `npm run test:e2e` | run Playwright checks for layout-sensitive flows |

## Use parts-bin in an existing app
Copy-paste checklist (clone what you need, in order):
- [ ] **Theme** — copy `src/theme/` and import `theme/theme.css` at your root. Re-skin via `tokens.css` only.
- [ ] **Primitives** — copy `src/components/ui/`; import from the `ui` barrel (`Button`, `Field`, `Drawer`,
  `IconButton`, `InlineAlert`, `SegmentedControl`, modals, tabs, toasts, …).
- [ ] **Shell** — copy `src/components/shell/` for the app shell, sidebar, top nav, and filter bars.
- [ ] **Charts & DataGrid** *(optional)* — copy `src/components/charts/` and `src/components/DataGrid/`;
  import from the `charts` and `DataGrid` barrels.
- [ ] **Maps & Chat** *(optional)* — copy `src/components/maps/` for geographic views and
  `src/components/chat/` for the assistant panel/composer/message primitives.
- [ ] **Examples** — consult `/docs`, `/examples/dashboard`, `/examples/datagrid`, `/login`, and
  `/settings` only as reference assemblies.
- [ ] **Boundary** — copy `scripts/lint-theme.mjs` and wire `npm run lint:theme` so raw colors never leak
  outside `src/theme/`.
- [ ] **Reference** — see `src/theme/RETHEME.md` to re-skin and `THEME-SPEC.md` for the canonical design spec.

Every design-system subsystem has a barrel (`ui`, `shell`, `charts`, `maps`, `DataGrid`, `chat`),
and `src/components` re-exports the reusable public surface as one aggregate import root. Import
from a barrel, not a deep file path:
```ts
import { Button, DataGrid, WaterfallChart, KpiCard } from './components'
```

### Experimental package entrypoints

The repo is still private, but the package boundary is now explicit enough to build library
artifacts for integration testing:

```bash
npm run build:lib
```

The root `parts-bin` entrypoint exports the aggregate component surface from `src/components`.
The DataGrid-only entrypoint is `parts-bin/datagrid`. It exports the neutral `DataGrid`,
`DataGridColumn`, `DataGridState`, editing and aggregation helpers, query/export helpers,
grid persistence/view hooks, saved-view helpers, and the generic `createMemoryServerAdapter`.
Demo account fixtures stay in deep demo files and are not part of this entrypoint.

Consumers must load the token theme once at the app root:

```ts
import 'parts-bin/theme.css'
import { DataGrid, type DataGridColumn } from 'parts-bin/datagrid'
```

Run `npm run test:package` to build the library and verify that `parts-bin/datagrid` imports
without demo fixtures. Peer dependencies for the DataGrid entrypoint are React, React DOM,
TanStack Table/Virtual, and dnd-kit. The root `parts-bin` entrypoint also uses the broader chart,
map, and chat dependencies.

parts-bin is intentionally a copy-paste kit first, not an npm package. Let the public API harden
across real cloned apps before packaging it.

## Theme recipes
parts-bin ships a single recipe — `parts-bin-default` — previewable in `/docs`. Recipes are
optional named token presets: variable overrides live in `src/theme/recipes.css` with metadata
in `src/theme/recipes.ts`. Add a `data-theme-recipe` block plus a matching entry to ship more.
The default theme maps primary action, recommendation intelligence, success, review, and
reject/blocker states to `--accent`, `--intel`, `--pos`, `--warn`, and `--neg`.

## Tech
Vite · React · TypeScript · Tailwind CSS v4 · Recharts · TanStack Table · Playwright · Vitest
