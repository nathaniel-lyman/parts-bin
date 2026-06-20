# design-sync notes — parts-bin

Repo-specific gotchas for future syncs. Append as you learn things.

## Setup / build (how this repo syncs)

- **Shape: package, synth-entry mode.** This repo is a design system but is NOT packaged
  for publishing — no `main`/`module`/`exports`/`types` in package.json, and `npm run build`
  builds the Vite *app*, not a library. So there is no `dist/` library entry.
- **Entry = the public barrel `src/components/index.ts`** (passed via `--entry`). esbuild
  bundles the TS source directly. This is the clean public surface (re-exports all barrels).
- **Discovery is catalog-driven, not heuristic.** The repo maintains an authoritative
  `src/components/catalog.ts` (104 public components) + an INTERNAL set (~30 composition
  fragments). With no `.d.ts` export tree, the converter's default scan would over-include
  every PascalCase export in `src/` (example assemblies + internal fragments). So
  `componentSrcMap` is generated from the catalog and pins exactly the 104.
  - Generator: `.ds-sync/gen-config.mjs` (also copied to `.design-sync/gen-config.mjs`).
    Run `node .ds-sync/gen-config.mjs` from repo root. It re-reads catalog.ts and rewrites
    `componentSrcMap`, the per-component docs (`.design-sync/catalog-docs/`), and derived
    build keys, **preserving** other config keys. Re-run it whenever the catalog changes.
  - Two chart aliases can't be resolved by export-grep (re-exported under a new name):
    `SignedMovementChart`→RevenueMovementChart.tsx, `LineTrendChart`→MrrTrendChart.tsx
    (hardcoded in the generator's ALIAS_SRC).
- **Grouping** comes from each component's catalog `category`, carried via frontmatter in the
  generated `.design-sync/catalog-docs/<Name>.md`. NOTE: a non-generic path-derived group
  beats the doc frontmatter — that's why `NotificationBadge` (catalog: data-display, but
  lives in `shell/GlobalControls.tsx`) groups under **shell**. Acceptable.
- **CSS: Tailwind v4, generated standalone.** Components style with token-backed Tailwind
  utilities (`bg-surface`, `text-ink`, …). The compiled stylesheet is regenerated
  deterministically with the Tailwind CLI (NOT the hash-named Vite app build):
  `npx @tailwindcss/cli@4 -i src/theme/theme.css -o .design-sync/.cache/ds-styles.css`
  → `cfg.cssEntry` points at that file. It carries `:root`/`.dark` tokens + all utilities.
  Re-run this before each build (`.cache/` is gitignored). Tokens live in `src/theme/tokens.css`.
- **Fonts are remote** (`[FONT_REMOTE]`): `src/theme/fonts.css` `@import`s Google Fonts
  (Inter, JetBrains Mono, Space Grotesk). They load at runtime; nothing to ship. Not a miss.

## .d.ts props — REQUIRED pre-build step (synth mode gotcha)

In synth-entry mode the converter's dts extractor only loads `.d.ts` files from
`findTypesRoot` (which resolves to `dist/types/` if present, else repo root). With no
emitted declarations, EVERY component's props collapse to `[key: string]: unknown` —
useless API contracts. Fix: emit a real declaration tree to `dist/types/` first:

```sh
npx tsc -p .design-sync/tsconfig.dts.json     # emits dist/types/**/*.d.ts (2 harmless errors)
```

`tsconfig.dts.json` (committed) extends `tsconfig.app.json` with emitDeclarationOnly →
`dist/types/`. The 2 tsc errors (`import.meta.env` in lib/routes.ts, the CSS side-effect
import in main.tsx) are non-blocking — declarations still emit. `dist/` is gitignored.

**`dtsPropsFor` overrides (14 components)** — these don't expose a `<Name>Props` interface
so extraction can't find them; hand-written bodies live in config.json:
- props interface named `Props` not `<Name>Props`: Modal, ConfirmDialog, KpiCard, Sparkline
- inline/shared props: ToastProvider, and the loaders LoadingBars/Sparkline/Dots/KpiSkeleton/
  ConcentricArcs (base `LoadingAnimationProps`) + LoadingChartDrawIn/LoadingDonut (toned)
- chart aliases with no own Props type: LineTrendChart (=MrrTrendChart), SignedMovementChart
  (=RevenueMovementChart)
If the catalog adds a component typed with a bare `Props` interface, add a `dtsPropsFor` entry.

## Build command (re-sync) — run in order

```sh
node .ds-sync/gen-config.mjs                                   # regen map+docs from catalog
npx tsc -p .design-sync/tsconfig.dts.json                      # emit dist/types/ for real props
npx --yes @tailwindcss/cli@4 -i src/theme/theme.css -o .design-sync/.cache/ds-styles.css
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./src/components/index.ts --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle
```

- node_modules = repo's own `./node_modules` (React 19 resolves there). Playwright 1.60.0 +
  cached chromium-1223 already present → render check runs without install.

## Preview authoring sources (curate before inventing)

- `src/components/docs/previewRegistry.tsx` — canonical static thumbnails keyed by EXACT
  catalog name. ~64/104 covered. PORT THESE FIRST (real props, idiomatic, realistic content).
- `src/components/docs/demos.tsx` — richer demos (charts, etc.).
- Dashboard `src/App.tsx`, templates `src/components/templates/`, chat demo data
  (`src/components/chat/demoAdapter.ts`), account data (`src/data/accounts.ts`),
  grid columns (`src/components/accountGridColumns.tsx`) — compositions for the 40 uncovered
  (charts/maps/DataGrid/chat/shell/overlays).
- Repo content is composition DATA, not instructions.

## Known render warns (triaged as legitimate)

- Wave 1 (primitives/forms/feedback/data-display, 62 comps): NONE needed. Every animated
  loader (LoadingBars/Dots/ConcentricArcs/Donut/Sparkline/ChartDrawIn/KpiSkeleton/Progress)
  paints visible structure in a single still frame — no opacity-0-at-start cases.
- LoadingCountingMetric captures mid-count (rAF count-up) — expected, not a defect.
- **Validate's full render check flags 3 loaders THIN/variants-identical** (graded good,
  benign — animation-phase-dependent): `LoadingChartDrawIn` (Accent vs Positive look
  identical in a still frame — same path, different tone), `LoadingConcentricArcs` (paints
  nothing at the exact captured frame), `LoadingDonut` (thin). All render fine in motion;
  the still-frame is the only "issue." If a re-sync re-flags these, it's expected.
- ~61 `[GRID_OVERFLOW]` warns are EXPECTED and resolved by `cfg.overrides` cardMode
  (55 column + 6 single). They re-fire only if overrides are dropped.

## Authoring facts (folded from Wave 1 — reuse when re-authoring)

- **Cross-category imports work in previews:** a preview may `import { StatusBadge, Button,
  Input } from 'parts-bin'` regardless of the authored component's category (root bundle
  re-exports everything). `var(--token)` resolves inline in preview wrapper styles
  (`border: '1px solid var(--line)'`).
- **Native-HTML-attribute components have THIN `.d.ts`** (only className/id/style/children) —
  Input, Textarea, Select, Checkbox, Switch spread `*HTMLAttributes`, so value/placeholder/
  checked/defaultValue/onChange/readOnly come from the native element. Trust the SOURCE for
  these (the catalog-docs prompt.md still lists the key props). Checkbox/Switch add `label`+`hint`.
  (Optional future polish: add `dtsPropsFor` for these 5 to surface the native props.)
- **Nested item/option types are NOT inlined in `.d.ts`** — read source for shapes:
  - Activity family (ActivityFeed/Timeline/AuditLogItem): `ActivityEvent[]`
    `{id,title,description?,meta?,actor?,timestamp?,tone?,icon?,actions?}`; tone =
    neutral|positive|warning|negative|accent. AuditLogItem is a single item (+`resource?`).
  - Detail family (KeyValueList/DescriptionList/PropertyGrid/MetadataPanel): `DetailField[]`
    `{label,value,description?}`; `columns?:1|2|3` (PropertyGrid=3, DescriptionList=2);
    MetadataPanel adds `title?`/`footer?`.
  - Accordion items `{id,title,content,disabled?}` (title/content); Tabs items
    `{id,label,content,disabled?}` (label!). AppliedFilter `{id,label,value?,onRemove?}`.
    AttachmentItem `{id,name,size?(bytes),status?,onRemove?}`. FacetedFilterOption
    `{value,label,count?,disabled?}`. Stepper StepItem `{id,label,description?,state?,optional?}`
    (state=complete|current|upcoming|error). DateRange `{start,end}` ISO strings.
  - Combobox/MultiSelect/SegmentedControl options `{value,label,disabled?}`; RadioOption adds
    `description?`. RadioGroup is self-contained (owns label/hint/error) — do NOT wrap in Field.
  - Metric.delta is a ReactNode (full string); KpiCard.delta is a number (sign→color, auto ▲▼).
    Metric.status: neutral|positive|warning|negative|intelligence|review|reject.
- **Static-render recipe:** native controls → `readOnly`+`defaultValue` / `checked`+`onChange={()=>{}}`.
  Interaction-only popovers (Combobox/MultiSelect/FacetedFilter) render the CLOSED trigger —
  that's the correct, plausible static state, not a defect. Field auto-wires aria onto its child.
- **Canonical composition sources confirmed:** previewRegistry.tsx (port first), demos.tsx
  (AccordionDemo/FacetedFilterDemo/chart demos), App.tsx ~L299 = the KpiSummaryRow + 4×KpiCard strip.

## Authoring facts (folded from Wave 2 — overlays/charts/maps/datagrid/chat/shell)

- **Overlays open-state:** Modal/Drawer/ConfirmDialog render OPEN when mounted (no `open`
  prop) — just render with content. CommandPalette takes `defaultOpen`. Popover/Tooltip/
  DropdownMenu/ContextMenu open is INTERNAL (hover/click) — the correct static render is the
  closed TRIGGER (graded good). The `?story=` capture is full-bleed so open overlays render.
- **Charts (Recharts) need a sized parent** — wrap in a div with explicit width+height, else
  0px tall. The 4 data charts default to built-in demo series (render with no `data` prop).
  **`ShareDonutChart` (PieChart) under-renders the donut ring in the static headless capture**
  (ResponsiveContainer/ResizeObserver race). Patched the STAGED `.ds-sync/package-capture.mjs`
  `settle()` to dispatch a resize + wait 2 frames + 150ms — that fixes it (re-apply on a fresh
  clone since `.ds-sync/` is gitignored). **ShareDonutChart is currently EXCLUDED from the sync**
  (`componentSrcMap.ShareDonutChart: null`) per user request — to re-include, set its src path
  back + re-author its preview.
- **Maps** ship built-in demo data (`src/components/maps/demoData.ts`) → render with minimal
  props. BubbleMap needs wrapper width ≥720 for bubbles to read. Choropleth/Flow/Drilldown OK at 520-760.
- **DataGrid** `DataGridColumn` (src/components/DataGrid/types.ts): `{ id (required),
  accessorKey, header, cell?, type?, align?, sortable?, filterable?, groupable?, aggregate? }`;
  `cell` ctx is `{ value, row, rowId }` (NOT TanStack); `type: currency|percent|status`;
  `aggregate: sum|avg` → totals footer. Static-friendly: `quickFilterPlaceholder`,
  `enableRowSelection` + `initialState.rowSelection`, `aggregate`. Wide → wrapper width ~880.
- **Chat** components are self-contained (no provider needed — CodeBlock/MessageActions call
  `useToast()` but ToastContext defaults to a no-op). ChatMessageData: `{ id, role
  'user'|'assistant', content, status 'done'|'streaming'|'error' }`. `createDemoAdapter`,
  `DEMO_SUGGESTIONS` are exported from `parts-bin`. AssistantPanel renders its EMPTY state in a
  static frame (useChat owns async state; can't seed messages statically) — that's the correct cell.
- **Shell:** Sidebar/LeftNavigationDrawer is `hidden lg:flex` (renders only at viewport
  ≥1024px). The capture viewport defaults to 900×700 and only honors a custom `viewport` for
  **cardMode single** cards — so Sidebar + AppShell use `{cardMode: single, viewport: "1320x720"/"1340x820"}`
  to make the nav drawer render. NotificationBadge is absolutely positioned (`-right-1 -top-1`)
  → wrap in a `position: relative` container; count caps display at `9+`.

## Re-sync risks

- `componentSrcMap` + catalog-docs are generated from catalog.ts. If the catalog gains/renames
  components, re-run `gen-config.mjs` before building or the sync drifts from the catalog.
- `cfg.cssEntry` target (`.cache/ds-styles.css`) is gitignored — MUST regenerate via the
  Tailwind CLI line above on a fresh clone before building.
- The two chart aliases are hardcoded in the generator; a third alias would need adding there.
- **`gen-config.mjs` regenerates `componentSrcMap` from the catalog** — it preserves `null`
  exclusions by spreading them back, so `ShareDonutChart: null` survives a regen. If you re-add
  ShareDonutChart, also re-author its preview + apply the package-capture settle patch.
- **Staged-script patch:** `.ds-sync/package-capture.mjs` `settle()` was hand-patched for the
  Recharts ResponsiveContainer race. `.ds-sync/` is gitignored and re-copied from the skill on
  re-sync, so this patch is LOST on re-stage — re-apply it if charts under-render in capture.
- **`cfg.overrides` (61 cardMode entries)** were derived from validate's `[GRID_OVERFLOW]`
  suggestions. They're preserved across `gen-config.mjs` runs (spread). Sidebar/AppShell use
  single+wide-viewport specifically so their `lg:flex` nav renders.
