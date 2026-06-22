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

## Implementation playbook

Use this repo as the source of truth when redoing another React frontend. The goal is not to
copy the sample dashboard; it is to adopt the theme layer, component API, layout patterns, and
verification rules, then rebuild the target app's actual routes and data flows with those parts.

### 1. Choose the adoption mode

| Mode | Use when | What to do |
|---|---|---|
| **Template repo** | Starting a new app | Use GitHub's **"Use this template"** button, delete unneeded examples, then build from `/docs` and the barrels. |
| **Copy into an existing app** | Reworking an app that already has routing, auth, data, or backend contracts | Copy the slices listed below, then replace old UI route by route. This is the default mode for "redo my frontend." |
| **Experimental package boundary** | Testing library-style integration before publishing | Run `npm run build:lib` and import from `parts-bin` / `parts-bin/datagrid`; keep in mind the package is still private. |

### 2. Audit the target app before editing

In the target app, make a short inventory:

- Routes/pages and their primary jobs.
- Existing layout shell, navigation, command/search surfaces, and settings surfaces.
- UI primitives already in use: buttons, inputs, selects, modals, drawers, tabs, cards, tables, alerts, toasts.
- Data-heavy surfaces: grids, charts, maps, KPI rows, activity feeds, details panels.
- Styling entrypoints: global CSS, Tailwind config, theme files, raw color usage.
- Verification commands and the smallest browser flows that prove the important screens still work.

Do not start by moving sample account/MRR code. Keep the target app's real domain model and replace
the presentation layer around it.

### 3. Copy the design-system slices

Copy only what the target app needs, in this order:

| Slice | Files | Required for |
|---|---|---|
| **Theme** | `src/theme/` | Every adoption path. Import `theme/theme.css` once at the target app root. |
| **Core UI** | `src/components/ui/` | Buttons, fields, selects, modals, drawers, menus, tabs, alerts, cards, toasts, loading states. |
| **Shell** | `src/components/shell/` | App chrome: sidebar, top nav, breadcrumbs, section headers, filter bars, settings panels. |
| **Data display** | `src/components/KpiCard.tsx`, `src/components/Sparkline.tsx`, relevant `ui` data-display components | Metrics, details, tables, activity, pagination, applied filters. |
| **DataGrid** | `src/components/DataGrid/` | Complex tables with sorting, filtering, saved views, pinning, selection, editing, export, server-query helpers. |
| **Charts** | `src/components/charts/`, `src/theme/chart-theme.ts` | Donuts, movement bars, trend lines, chart cards, legends, tooltips. |
| **Maps** | `src/components/maps/` | Choropleth, bubble, flow, and drilldown maps. |
| **Chat** | `src/components/chat/` | Assistant panel, composer, markdown messages, message actions, prompt chips. |
| **Theme lint** | `scripts/lint-theme.mjs` | Enforcing the no-raw-colors boundary in the target app. |

Keep imports at the barrel level where possible:

```ts
import { Button, Card, Drawer, Field, KpiCard } from './components'
import { DataGrid, type DataGridColumn } from './components/DataGrid'
```

If the target app uses a different folder convention, preserve the component boundaries even if the
paths change. Avoid deep imports into component internals.

### 4. Map old UI to parts-bin

Use `/docs` and `src/components/catalog.ts` as the component picker. A typical migration map looks
like this:

| Existing UI need | parts-bin component |
|---|---|
| Primary/secondary/destructive action | `Button` |
| Icon-only toolbar action | `IconButton` |
| Text, textarea, select, combo, date, switch, slider | `Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `Switch`, `Slider` |
| Labeled form row and validation text | `Field` |
| Modal workflow | `Modal` or `ConfirmDialog` |
| Side panel workflow | `Drawer` |
| Menus and command/search | `DropdownMenu`, `ContextMenu`, `CommandPalette` |
| Page shell and navigation | `AppShell`, `Sidebar`, `TopNav`, `Breadcrumbs`, `SectionHeader` |
| KPI or compact metric | `KpiCard`, `Metric`, `Sparkline` |
| Simple table | `Table` |
| Full-featured table/grid | `DataGrid` |
| Empty, loading, error, or toast state | `EmptyState`, `Skeleton`, `Spinner`, `InlineAlert`, `Banner`, `ToastProvider` |
| Status, label, applied filter | `StatusBadge`, `Tag`, `AppliedFiltersBar`, `FacetedFilter` |
| Details and audit surfaces | `DetailHeader`, `KeyValueList`, `DescriptionList`, `ActivityFeed`, `Timeline` |
| Chart surface | `ChartCard`, `ShareDonutChart`, `LineTrendChart`, `SignedMovementChart`, `WaterfallChart` |
| Assistant UI | `AssistantPanel`, `ChatComposer`, `ChatMessageList`, `ChatMessageBubble` |

### 5. Rebuild route by route

For each target route:

1. Keep the route's real data loaders, mutations, permissions, and analytics intact.
2. Replace page chrome with `AppShell` / `Sidebar` / `TopNav` patterns where appropriate.
3. Replace controls with parts-bin primitives from the catalog.
4. Replace local layout glue with token-backed Tailwind utilities: `bg-bg`, `bg-surface`,
   `border-line`, `text-ink`, `text-muted`, `text-accent`, `text-pos`, `text-warn`, `text-neg`,
   plus `.display`, `.micro`, and `.num`.
5. Convert dense tables to `DataGrid` only when the screen needs grid behavior. Use `Table` for
   simple static tables.
6. Convert charts by mapping the target app's real series into the generic chart contracts. Do not
   import account/MRR demo data.
7. Add route-level empty, loading, error, and disabled states instead of preserving fake defaults.

Use examples only as composition references:

- `/examples/dashboard` — KPI + charts + read-only table assembly.
- `/examples/datagrid` — advanced grid behavior and server-query patterns.
- `/login` — split brand-panel sign-in.
- `/settings` — preferences, color mode, theme recipe, density.

### 6. Re-skin through tokens only

Edit `src/theme/tokens.css`, `src/theme/theme.css`, `src/theme/fonts.css`, and when needed
`src/theme/chart-theme.ts`. Do not put raw colors in components or route files.

The hard rule:

- No `#hex`, `rgb()`, `hsl()`, or named Tailwind color utilities like `bg-blue-500` outside the
  theme layer.
- Use existing token utilities first.
- Add or derive a token when the target brand needs a visual role the system does not have.
- Update both light and dark mode.

See `src/theme/RETHEME.md` and `skills/retheme/SKILL.md` for the full checklist.

### 7. Verify the downstream rewrite

Use the target app's own verification commands plus these adoption checks:

- Build/typecheck the target app.
- Run the target app's focused tests for every touched route.
- Run or port `npm run lint:theme` so raw colors do not leak outside `src/theme/`.
- Browser-check the rebuilt routes at desktop and mobile widths.
- Exercise keyboard/focus behavior for modals, drawers, menus, command palette, forms, and grids.
- Confirm loading, empty, error, and permission-denied states are truthful.
- Confirm old sample data, old screenshots, and unused UI dependencies were removed only when no
  longer referenced.

Before claiming the rewrite is done, report exactly which target-app commands and browser checks ran.

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
| **`/examples/datagrid`** — interactive DataGrid harness with grouping, server mode, selection, CRUD, saved views, row pinning, editing, tree/detail rows, advanced filtering, keyboard navigation, and export flows | ![Sign-in page](docs/screenshots/login-light.png) **`/login`** — example split brand-panel sign-in |
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
- **`src/components/DataGrid/`** — neutral, TanStack-backed grid with nulls-last/custom sorting,
  two-condition column filters, pagination, row selection, saved views, row pinning, range
  copy/paste, inline editing, grouping, built-in/custom aggregation, tree rows, detail panels,
  CSV/TSV export, server-query helpers, ARIA grid semantics, roving keyboard focus, F2/type-to-edit,
  arrow-key row expand/collapse, and live screen-reader announcements.
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

The repo ships executable workflows for AI coding agents (Claude Code, Cursor, Codex, …). For a
frontend rewrite, the playbook above is the main path: audit the target app, copy the needed
design-system slices, rebuild route by route, re-skin through tokens, and verify in the target app.
The checked-in skills cover the common sub-tasks an agent will hit along the way.

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

## Public imports and package boundary

Every design-system subsystem has a barrel (`ui`, `shell`, `charts`, `maps`, `DataGrid`, `chat`),
and `src/components` re-exports the reusable public surface as one aggregate import root. When
copying parts-bin into a target app, import from a barrel, not a deep file path:

```ts
import { Button, DataGrid, WaterfallChart, KpiCard } from './components'
```

The repo is still private and intentionally copy-first, but the package boundary is explicit enough
to build library artifacts for integration testing:

```sh
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

Use package-style imports only when testing the library boundary. For ordinary frontend rewrites,
prefer the copy workflow in the implementation playbook so the target app owns its theme, routes,
and verification.

## Theme recipes
parts-bin ships a single recipe — `parts-bin-default` — previewable in `/docs`. Recipes are
optional named token presets: variable overrides live in `src/theme/recipes.css` with metadata
in `src/theme/recipes.ts`. Add a `data-theme-recipe` block plus a matching entry to ship more.
The default theme maps primary action, recommendation intelligence, success, review, and
reject/blocker states to `--accent`, `--intel`, `--pos`, `--warn`, and `--neg`.

## Tech
Vite · React · TypeScript · Tailwind CSS v4 · Recharts · TanStack Table · Playwright · Vitest
