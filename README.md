# Ledger — a swappable dashboard theme (React + Tailwind v4)

[![CI](https://github.com/nathaniel-lyman/parts-bin/actions/workflows/ci.yml/badge.svg)](https://github.com/nathaniel-lyman/parts-bin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A runnable dashboard starter implementing the **Ledger** design system: sharp, technical,
data-first. Clone it, run it, customize it — or lift the `src/theme/` folder into your own app.

**[Live demo →](https://nathaniel-lyman.github.io/parts-bin/)** · explore `/compose`, `/docs`, `/login`, and `/settings` in the running app.

![Ledger dashboard, dark mode](docs/screenshots/dashboard-dark.png)

**The whole skin lives in one folder.** Change `src/theme/tokens.css` (or apply a shipped
recipe) and every component, chart, and page re-skins — zero component edits, enforced by lint:

| Ledger default | `ops-green` recipe — same app, one folder changed |
|---|---|
| ![Default theme](docs/screenshots/dashboard-dark.png) | ![Ops green recipe](docs/screenshots/dashboard-ops-green.png) |

## Who is this for?

- **Developers** building an internal tool or SaaS dashboard — clone it, re-skin it, swap the
  demo data for your domain, ship.
- **Data analysts** with a reporting need — hand this repo to your AI coding agent (or a
  developer) with your brand colors and KPIs, and you get a branded, interactive dashboard
  instead of another static spreadsheet. The [agent skills](#agent-skills) make that a guided,
  verified procedure, not a hope.
- **Founders and PMs** who need a credible product demo fast — every page a dashboard product
  needs is already built; `/compose` walks you through assembling your own.

The demo domain is SaaS accounts and MRR, but nothing about the framework is SaaS-specific —
see [the domain mapping below](#your-first-30-minutes) for what the same dashboard looks like
as grocery store performance or a supplier scorecard.

## Quickstart
```bash
npm install
npm run dev
```

Starting a new project from this repo? Use GitHub's **"Use this template"** button (or clone and
delete `.git`) so you begin with a clean history.

**First stop after the dev server starts: open [`/compose`](http://localhost:5173/compose).**
The guided App composer is the front door to the kit — pick a use case, layout, theme recipe,
and data mapping, and it generates the route, import, and theme snippets to build from.

## Your first 30 minutes

The fastest path from clone to *your* dashboard is three steps, and an AI coding agent can run
all of them via the checked-in [agent skills](#agent-skills). Suppose you're an analyst at a
grocery chain like Aldi:

1. **Re-skin** — *"run the `retheme` skill: accent Aldi blue `#00005F`, secondary cyan
   `#25C5E8`, warm orange highlights, slightly rounder corners."* Every component, chart, and
   page re-skins from `src/theme/` alone.
2. **Swap the data** — *"run the `swap-data-domain` skill: the entity is Store, KPIs are total
   weekly sales, open stores, stores below target, and comp sales growth."* The KPI cards,
   charts, and data grid all derive from one pipeline, so they follow automatically.
3. **Verify** — *"run the `verify-changes` skill."* Build, tests, and the theme-boundary lint.

Nothing in the framework is tied to the SaaS demo domain — it's one mapping away from yours:

| Shipped SaaS demo | Grocery store performance | Supplier scorecard |
|---|---|---|
| Account — name, owner | Store — number, district manager | Supplier — vendor, buyer |
| MRR | Weekly net sales | On-time fill rate (%) |
| Segment: Enterprise / Mid-market / Startup | Division or store format | Category: produce / dairy / dry goods |
| Status: Active / At risk / Churned | On-target / Below target / Remodel | Compliant / Watch / Suspended |
| Growth % | Comp sales growth | Fill-rate trend |

Both alternate domains exist as typechecked reference files —
[`src/data/examples/grocery-stores.ts`](src/data/examples/grocery-stores.ts) and
[`src/data/examples/supplier-scorecard.ts`](src/data/examples/supplier-scorecard.ts) — showing
the demo's types, seed rows, and chart series remapped, plus the selector semantics you'd need
to decide. The mechanics of the swap — types, seed data, selectors, grid columns, in dependency
order — are written down in [`skills/swap-data-domain/SKILL.md`](skills/swap-data-domain/SKILL.md).

## Pages out of the box

Every surface a dashboard product needs, already built from the kit's own primitives. Start at
**`/compose`** — the guided composer that assembles the rest of these into your app:

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
- **`src/components/templates/`** — full-page starters you can route to directly: a guided
  **App composer** (`/compose`), a dashboard, two workflow consoles, plus a split brand-panel **Login** (`/login`) and a section-scroll
  **Settings** (`/settings`) page. The starter pages are presentational demos — Settings'
  Appearance section is the live home for color mode, theme recipe, and density.
- **`src/hooks/`, `src/selectors/`, `src/data/`** — client-side state, derived metrics, seed data.
- **`/compose`** — guided admin-app composer that generates route, import, data-mapping, and theme snippets.
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
| [`swap-data-domain`](skills/swap-data-domain/SKILL.md) | Replace the demo accounts/MRR data with your domain, end to end |
| [`add-component`](skills/add-component/SKILL.md) | Add UI the right way: catalog-first, token-only styling |
| [`verify-changes`](skills/verify-changes/SKILL.md) | Run the full done-checklist, including the failures tests alone miss |

Skills are plain markdown in the open Agent Skills format (`skills/<name>/SKILL.md`). Claude Code
picks them up automatically via `.claude/skills/`; other tools find them through
[AGENTS.md](AGENTS.md).

## Scripts
| Command | Does |
|---|---|
| `npm run dev` | start the app |
| `npm run build` | typecheck + production build |
| `npm run test` | run the Vitest suite |
| `npm run lint:theme` | fail if raw colors leak outside `src/theme/` |

## Use Ledger in an existing app
Copy-paste checklist (clone what you need, in order):
- [ ] **Composer** — open `/compose` to choose a use case, layout, theme recipe, and data mapping, then use the generated route/import snippets.
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
