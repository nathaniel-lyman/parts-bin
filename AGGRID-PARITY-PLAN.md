# DataGrid → AG Grid Parity & Polish — Master Plan

> **Purpose:** Resumable roadmap for bringing `src/components/DataGrid/` up to premium AG Grid
> Enterprise polish. This doc is self-contained — a fresh session can pick up from here.
> **Branch:** `datagrid-aggrid-polish` (off `main`). **Started:** 2026-06-21.

---

## How to resume (read first)

1. `git checkout datagrid-aggrid-polish` and `git log --oneline` to see progress.
2. Re-read the **Status snapshot** below for what's done / in flight / next.
3. Verification protocol is at the bottom — run the focused gate after each step.
4. **Baseline is GREEN as of Phase D** — the 2 long-pre-existing `aggregation.test.ts` failures are
   fixed (`5dd9d80`). The whole repo suite passes; any failure now is a regression.

---

## Locked scope decisions (from the user)

- **Ambition:** *Premium feel + fix the fault lines.* Foundation refactor, full render-layer
  memoization, the a11y/ARIA pass, correctness bug fixes, expanded filters, and the polish
  quick-wins. **DEFER** the XL enterprise chrome (side bar / tool panels, pivoting, integrated
  charts, server-side grouping/aggregation, the full custom-component API seam).
- **Sequencing:** *Foundation-first* (architecture + memoization gate everything else).
- **Breaking changes:** *OK now* (pre-1.0). Free to narrow the public barrel, drop deprecated
  aliases, and reshape internal component signatures.
- **Subagents/workflows:** explicitly authorized (overrides the CLAUDE.md "no subagents" default).
- **The review sweep** that produced this plan was a 6-dimension multi-agent audit (71 findings).
  Full themes/gaps are in the "Review roadmap" section below.

---

## Status snapshot

| Phase | State | Notes |
|---|---|---|
| **A — Foundation refactor** | ✅ COMPLETE | hook extraction ✅, Ledger codemod ✅, barrel narrowing ✅; 'actions' id refactor → moved to B |
| **B — Render-layer memoization** | ✅ COMPLETE | `GridRuntimeContext` + memo ✅, debounce/throttle ✅, O(1) pinned indexing ✅, `lockPosition` capability ✅; adversarial-review fixes folded |
| **C — Interaction polish** | ✅ COMPLETE | selection tint, cell flash, lucide icons, overlay/skeleton states, resize/reorder/fill affordances, scrollbar/popover/density polish |
| **D — Correctness + filter depth** | ◑ MOSTLY DONE | **baseline now GREEN** (2 pre-existing aggregation failures fixed); percent round-trip, date timestamps, expanded operators, export BOM/html, floating-filter sync, set filter — all done. **Deferred: two-condition AND/OR + shared comparator/nulls-last.** |
| **E — Accessibility / ARIA pass** | ⬜ next | |

### Commits on the branch so far
- `07f5b37` — extract god-component into six hooks (DataGrid.tsx 1310 → 898 lines)
- `16f8d58` — drop deprecated `Ledger*` type aliases for canonical `DataGrid*` (~25 files)
- Phase B: `7984cbb` memoize render layer (context + React.memo Row/Cell) · `3883e16` debounce
  filter + rAF-throttle scroll/resize · `3b87678` O(1) pinned indexing + `virtualizeRowThreshold`
  prop · `e75c6ab` `'actions'` → `lockPosition` capability · `2cb3fc0` review fixes (flush
  resize on release, flush/cancel filter on blur/re-sync)
- Phase C: `496a257` selected-row tint + hover/range split · `32373ee` cell-change flash ·
  `c2a563b` lucide sort icons + badge + chevrons · `190d085` overlay states + skeleton rows ·
  `ed34d23` thin scrollbar + popover-enter + density transition · `ed6513c` resize guide-line +
  reorder drop-indicator · `3ae7032` range corner fill handle
- Phase D: `5dd9d80` aggregation '—' + baseline green · `2f627b6` scale-aware percent paste ·
  `86da293` date timestamp filters · `d5d6853` expanded operators · `bafc938` CSV BOM + html
  clipboard · `2b1b81f` floating-filter sync · `9e78ef9` set filter (search/select-all/counts)

### Phase D — MOSTLY DONE (2 items deferred)
The **baseline is now GREEN** — the 2 long-standing `aggregation.test.ts` failures are fixed, so the
whole repo suite passes (735 tests). All work is test-driven; full gate green (`npm run build`,
`npx vitest run`, `npm run lint`, `lint:theme`).

**Correctness (the bug slice):**
- **Aggregation** (`5dd9d80`): a null/empty aggregate renders `'—'` (was blank); the stale percent
  test now expects `'4.0%'` to match how percent cells render. Guards added: count-weighted average
  over all rows (not avg-of-subset-averages), and an integration test proving the footer avg spans
  every filtered row, not just the page (client-mode "page-scoped" concern — server-mode totals still
  need server aggregation, out of scope).
- **Percent paste round-trip** (`2f627b6`): `parseDraft` is scale-aware — a copied `"5.0%"` reverses
  the column's scale back to the raw value (`raw = shown / (scale*100)`), fixing the 100× corruption
  for fraction-stored percents. Bare `parseDraft` (no format) still just strips the symbol.
- **Date filters** (`86da293`): `before/after/between` parse to timestamps (`toTimestamp`) instead of
  lexical string compare, so US/ISO/mixed formats order chronologically; unparseable/blank excluded.

**Filter depth:**
- **Expanded operators** (`d5d6853`): text +notContains/notEquals/endsWith/blank/notBlank; numeric
  +notEquals/gte/lte/blank/notBlank; date +blank/notBlank. `VALUELESS_OPERATORS` drives the menu's
  value-less UI. New operators serialize through `toGridQuery` unchanged for server mode.
- **Export niceties** (`bafc938`): `downloadCSV` prepends a UTF-8 BOM (Excel encoding); `copyToClipboard`
  writes a `text/html` table alongside `text/plain` for tabular copies (falls back to writeText —
  jsdom/old browsers — so existing tests hold). `tsvToHtmlTable` exported + tested.
- **Floating-filter sync** (`2b1b81f`): the inline header filter now preserves the menu's operator
  (greaterThan/gte/startsWith/…) instead of resetting to contains/equals, and renders a read-only
  summary chip + clear button for multi-value/valueless filters (between/isAnyOf/blank) instead of an
  empty input that dropped them.
- **Set filter** (`9e78ef9`): `isAnyOf` is now a type-agnostic engine predicate; the table wires
  TanStack faceted models (client mode); the enum/status checklist became a `SetFilterList` — search +
  tri-state (Select all) respecting the search + per-value faceted counts. Values union predefined
  options with present values.

**Deferred (carry to a follow-up):**
- **Two-condition AND/OR per column** — changes the public `FilterValue` shape + persistence + query
  serialization; deliberately punted for a dedicated design pass (user call).
- **Shared client/server comparator + optional `comparator` + nulls-last** — TanStack v8 `sortUndefined`
  only catches literal `undefined` (not `null`/`''`) and direction-independent nulls-last needs a
  custom path; not a quick flag, so deferred with the AND/OR work.
- Free-text **set filter** as an alternate mode alongside the operator filter (the checklist currently
  lands on enum/status, the natural home).

### Phase C — DONE
All colors are theme tokens (no raw hex / no new named utilities); every visible change is behavior-
preserving and gated with `tsc` + the DataGrid suite + `lint:theme`. Phase B's memoization is intact
(`GridRuntimeContext` value + handlers stayed identity-stable; new per-row/per-cell signals are
narrow primitives). **Full gate green:** `npm run build` ✅, `npx vitest run` = 717 passed / **the 2
known pre-existing aggregation failures only**, `npm run lint` ✅, `lint:theme` ✅.

- **Selected-row tint** (`496a257`): selected `<tr>` paints `bg-accent-soft` incl. the sticky
  selection cell + any pinned/sticky data cells (their opaque bg used to hide the tint); the band
  holds on hover. **Hover/range split:** hover is now the neutral `surface-2` at row level,
  `accent-soft` reserved for selection/range. `selected` flows to cells only for pinned sides, so a
  selection toggle re-renders just the toggled row's sticky cells.
- **Cell-change flash** (`32373ee`): one-shot tint on value change — `pos-soft`/`neg-soft` for
  numeric up/down, `accent-soft` neutral otherwise. Detected wholly inside the memoized `DataGridCell`
  via React's derive-state-from-a-changed-value-during-render pattern (guarded setState, no effect, no
  render-time ref read — which the React Compiler lint forbids); the keyed overlay survives unrelated
  re-renders and `onAnimationEnd` clears it. `@keyframes ledger-cell-flash`, reduced-motion gated.
- **Lucide icons** (`c2a563b`): sort = `ArrowUp`/`ArrowDown`; sortable-but-unsorted shows a faint
  `ChevronsUpDown` hint on header hover/focus; multi-sort priority is a styled pill badge (kept the
  `sort-priority` testid + 1-based index). Group/tree expanders use `ChevronDown`/`ChevronRight`.
  Header label restructured to a flex row (text truncates, sort cluster stays visible); alignment
  classes + `col-header-label` testid on the outer span, `data-autofit-label` on the inner text span.
- **Overlay-style loading/empty/error + skeleton** (`190d085`): a relative wrapper hosts a
  pointer-transparent `bg-surface/70` backdrop with the state card centered (min-h gives it room).
  Initial load renders `DataGridSkeletonRows` (token shimmer, aria-hidden) instead of collapsing the
  tbody; a refetch keeps the real rows mounted + dimmed. State components' text/roles unchanged.
- **Resize guide-line + reorder drop-indicator** (`ed6513c`): full-height accent line tracks the
  cursor during a resize (portalled to `<body>`, rAF-coalesced, cleared on release); a crisp accent
  insertion bar marks the column-reorder drop edge, derived from the live drag preview.
- **Range corner fill handle** (`3ae7032`): visible accent handle on a multi-cell range's bottom-right
  corner (editing only). Click fills the range from each column's anchor-row value via the existing
  validate → `onRowUpdate` path (`fillSelection`). **Stretch deferred:** drag-to-extend-then-fill and
  series increment (the click-to-fill ships the paste-fill value semantics).
- **Scrollbar / popover / density** (`ed34d23`): thin token-backed grid scrollbar
  (`.ledger-scroll-thin`), 120ms `popover-enter` on the column/context menus + dialogs, and a row-
  height transition on density change (`.ledger-density-anim`). All reduced-motion gated both ways
  (media query + the explicit `html[data-reduce-motion]` opt-in).

### Phase B — DONE
- **Memoization (the fault-line fix):** `GridRuntimeContext` collapses the Body→Row→Cell
  prop-drill into one memoized value; `DataGridRow`/`DataGridCell` are `React.memo`'d. `focus`/`range`
  are passed as narrow **per-row primitives** (`focusedColIndex`/`rangeColStart`/`rangeColEnd`),
  deliberately **NOT** in the context — putting them there would re-render every cell on each arrow
  key and defeat the cell-level memo. Orchestrator derivations (`visibleData`, `visibleColumnIds`,
  `columnWidthMap`, `pinnedGroups`, `exportData`, `footerAggregates`) are memoized off TanStack's
  memoized row model; `dispatch` is a stable latest-ref (layout effect), handlers + `editingApi` are
  identity-stable — so a selection toggle / single-row edit re-renders only the affected row.
- **Debounce/throttle:** header free-text/number/date filters debounce ~200ms (`FloatingFilterInput`,
  local draft, commit on blur, cancel on external re-sync); `useScrollMetrics` and resize pointermove
  are rAF-coalesced (resize flushes the final position on release).
- **O(1) pinned-row indexing** (id→index map, only when rows pinned) + `virtualizeRowThreshold` prop
  (threaded into body windowing + focus-restore).
- **`'actions'` magic id → `lockPosition: 'last'` capability:** `normalize`/`reducers` thread a
  `lockedIds` set derived from columns; legacy `id === 'actions'` and `type: 'actions'` stay
  back-compat; component checks use `meta.actions` / `lockedIds`. New normalize tests cover a
  generic (non-actions) locked column.
- **Verification:** behavior-preserving — full repo suite green except the 2 known pre-existing
  aggregation failures; `npm run build` / `lint` / `lint:theme` clean. A 6-agent adversarial review
  surfaced 2 real lost-update bugs (throttle/debounce), both fixed with regression tests.

### Phase A — done
- **Hook extraction (DataGrid.tsx 1310 → 898 lines), behavior-preserving:**
  - `useColumnDragPreview` — column-reorder drag projection + dnd handlers
  - `useScrollMetrics` — scroll offset/width for column virtualization
  - `usePinnedColumnOffsets` — DOM-measured sticky pinned-column offsets
  - `useInlineEditing` — edit session, dirty cells, the editing API
  - `useGridSelectionFocus` — roving focus + drag cell-range selection + focus restore
  - `useGridClipboard` — copy/paste/export + the two window-level listeners
- **`Ledger*` → `DataGrid*` codemod** — removed `LedgerGridColumn/LedgerGridState/LedgerCellContext`
  aliases from `types.ts`; updated all internal usages + the `types.test.ts` compat test.

### Phase A — DONE
- Barrel narrowed (commit `b09a9af`): `DataGridHeader/Body/Row/Cell/SelectionCell/ColumnDragOverlay`
  are now deep-import only; `DataGrid` + `Toolbar`/`Footer` stay barrel-exported. `catalog.ts`
  `INTERNAL` map reconciled (the guard test forbids stale INTERNAL keys). All internal usage was
  already deep-path, so no call sites changed.

### Re-sequencing notes (two items moved A → B)
1. **`GridRuntimeContext`** — its only payoff is making `DataGridRow`/`DataGridCell` memoizable,
   which *is* Phase B. Doing it in A would refactor the render chain twice. No scope dropped.
2. **`'actions'` magic column-id → capability flags** — turned out structural, not a find-replace:
   `normalize.ts` bakes the literal `'actions'` into column order (forced last), pinning (forced
   right), sorting/grouping (excluded), and visibility (forced visible), all via **id-only** helpers
   (`readonly string[]`, no column-capability access). A true refactor threads a derived
   "locked-column-ids" set through `normalize` → `reducers` (it already receives `columns`) → `state`
   /`persistence`, honoring a new `lockPosition: 'last'` flag AND `type: 'actions'` for back-compat.
   Folded into B because B rethreads the component-side `'actions'` checks (Cell/Row/DataGrid) anyway.
   Also fold in the `RESET_COLUMNS` hard-coding cleanup (reducers embed account presets like
   `density: 'compact'`, `right: ['actions']`). Strong safety net: `normalize.test.ts`,
   `reducers.columnOrder/columnPinning/sorting.test.ts`.

---

## The five phases (detailed)

### Phase A — Foundation refactor  *(gates everything)*
Split the 1310-line god-component into hooks (DONE) + the two remaining hygiene items above.
Target: orchestrator well under its old size, all concerns in testable units, clean public surface.

### Phase B — Render-layer memoization  *(the perf fault-line fix)*
The single biggest gap between "has virtualization" and "feels like AG Grid at scale."
- **`GridRuntimeContext`**: carry the runtime-wide values currently drilled 3 levels through
  Body→Row→Cell (dispatch, focus, range + handlers, dragPreview, editing, pinnedOffsets,
  columnWindow, visibleColumnIds, onFocusCell, onToggleRow, onCellContextMenu, onCopyCell,
  renderAggregatedCell, treeColumnId, enableRowSelection). Per-row props stay props
  (row, rowIndex, selected, pinned, rowLabel).
  - *Test impact:* 4 files construct Body/Row/Cell directly with props — `DataGridRowCell.test.tsx`,
    `DataGridCell.contextmenu.test.tsx`, `DataGridHeaderBody.test.tsx`, `DataGridSelectionCell.test.tsx`.
    Give the context a complete default value so prop-less renders still work; wrap the few tests
    that exercise dragPreview/onCellContextMenu in a provider.
- **`React.memo` on `DataGridRow` + `DataGridCell`** with custom comparators keyed on
  cell.id/value, focused, rangeSelected, isDirty, pinnedOffset, column size.
- **Stabilize per-cell callbacks**: `DataGridRow` currently creates per-cell `onCopy`/`onContextMenu`
  closures every render — make them id-based (pass rowId/colId, read handler from context) so memo holds.
- **Memoize derivations** in the orchestrator: `columnWidthMap`, `visibleData`, `exportData`,
  `footerAggregates`, `visibleColumnIds`, `pinnedGroups`, the `columnWindow` ids.
- **Debounce header-filter typing** (~150-250ms before dispatch); **rAF-throttle** column resize
  pointermove and the scroll handler (`useScrollMetrics`).
- **Fix O(n) indexOf** for pinned (top/bottom) rows in `DataGridBody` (build an id→index map);
  make the `rowCount > 100` virtualization threshold a prop.
- **`'actions'` magic-id → capability flags** (moved from A): add `lockPosition: 'last'` (keep
  `type: 'actions'` for back-compat), derive a locked-ids set in the reducer (it already gets
  `columns`), thread it through `normalize`/`state`/`persistence`, and convert the component-side
  `id === 'actions'` checks (Cell/Row/DataGrid) while they're being rethreaded for context. Plus the
  `RESET_COLUMNS` hard-coded-preset cleanup.

### Phase C — Interaction polish  *(visible "this is AG Grid" wins)*
All colors must be theme tokens (no raw hex outside `src/theme/`; avoid new `bg-black/40`-style utilities).
- **Selected-row tint** (`bg-accent-soft` on selected `<tr>`, incl. pinned/sticky cells) — selection
  is currently invisible except the checkbox. *(S, highest impact-per-effort)*
- **Cell-change flash** — transient highlight on value change (`@keyframes` in `base.css` using
  `--pos-soft`/`--neg-soft`, reduced-motion gated).
- **Separate hover from range color** — cells currently use `bg-accent-soft` for BOTH hover and range;
  use `surface-2` for hover, reserve accent for selection/range.
- **Lucide icons** for sort (ArrowUp/Down/ChevronsUpDown) + faint hover sort hint + styled multi-sort
  index badge; lucide chevrons for group/tree expanders (replace unicode ▲▼▸▾).
- **Overlay-style loading/empty/error** centered over a dimmed grid (currently text blocks *below*
  the table); skeleton rows during load (reuse `.ledger-loading-shimmer`) instead of collapsing tbody.
- **Resize guide-line** (full-height during drag), **column-reorder drop-indicator** (insertion bar),
  **range corner fill handle** (visible handle; reuse paste-fill for drag — full series-increment is a stretch).
- **Thin token-backed scrollbar**, **popover-enter animation** (~120ms, reduced-motion gated),
  **density height transition**.

### Phase D — Correctness + filter depth
- **Fix the 2 pre-existing aggregation tests** (`'4%'` vs `'4.0%'`; empty set should format `'—'`).
- **Bugs:** avg-of-avgs (footer avg is page-scoped / not count-weighted); date filters do lexical
  string compare on possibly-mismatched formats (parse to timestamps); **percent paste round-trip
  100× corruption** (make `parseDraft` scale-aware; add round-trip tests).
- **Filter operators:** add notContains/notEquals/endsWith/blank/notBlank/gte/lte; two-condition
  AND/OR per column. **Set filter** with search + (Select All) + per-value counts (derive distinct values).
- **Floating filter** synced to the real `FilterValue` (currently a parallel impl that drops
  greaterThan/between/isAnyOf); shared client/server comparator + optional `comparator` + nulls-last;
  CSV UTF-8 BOM + `text/html` clipboard alongside TSV.

### Phase E — Accessibility / ARIA-grid pass  *(one coherent workstream)*
- **`aria-rowindex`/`aria-colindex`** on every rendered row/cell (virtualization makes `aria-rowcount`
  report the full set while ~20 unindexed rows exist) — incl. deciding the selection-column index basis.
- **Single tab stop / roving focus**: rows → `tabIndex=-1` (Space toggles on focused cell, already works);
  header filter/menu buttons → `tabIndex=-1` with a keyboard path (e.g. Alt+Down) to open them.
- **Live-region announcer** (visually-hidden `aria-live=polite`) for sort/filter-count/selection/paste/reorder.
- **F2-to-edit** + **type-to-edit** (printable char seeds the editor); focus restoration after virtualized
  jumps; ArrowLeft/Right expand/collapse from any column; `aria-multiselectable`; expanded ARIA test suite.

---

## Review roadmap (the 71-finding audit, condensed)

**Honest read:** strong mid-tier grid covering ~70-80% of AG Grid Enterprise everyday features
(multi-sort, type-aware filters + floating row, reorder/resize/pin/hide, row+col virtualization,
range select + TSV copy, paste-fill, inline/full-row edit, client grouping+aggregation, tree data,
master/detail, pinned rows/cols, CSV/XLSX export, saved views, density, clean server query/adapter
seam). Healthy architecture. NOT yet "premium AG Grid feel"; the distance is concentrated in:
(1) two fault lines — **zero render memoization** + **broken ARIA-under-virtualization**;
(2) interaction polish that makes AG Grid feel alive; (3) filter/correctness depth.

**Six workstreams (= our phases):** Render-layer perf (8 findings) · A11y/keyboard (10) ·
Interaction polish (12) · Architecture & API seams (10) · Enterprise feature surface (14, mostly
DEFERRED) · Data-ops correctness & server depth (11).

**Top gaps (ranked):** no Row/Cell memoization (critical) · ARIA row/col indices under virtualization
(critical) · single-tab-stop violation (high) · selected-row tint + cell flash invisible (high) ·
1310-line god-component (high — DONE) · no custom renderer/editor/filter API seam (high — DEFERRED) ·
enterprise data features client-only (high — DEFERRED) · no side bar/tool panels (high — DEFERRED) ·
shallow filters + correctness bugs (high — Phase D) · no live region (high — Phase E).

**Quick wins (S):** selected-row tint · hover/range color split · lucide sort/chevron icons ·
thin scrollbar · popover-enter animation · F2/type-to-edit · CSV BOM + clipboard HTML ·
floating-filter sync · debounce filter typing.

**Deferred (out of "premium feel + fault lines" scope):** side bar / tool panels · multi-level
header groups · pivoting · integrated charts · status bar · undo/redo · full custom-component API
(cellRenderer/editor/filter/headerComponent + valueGetter/Formatter/Parser) · server-side
grouping/aggregation/infinite row model · row-drag reordering · rich Excel export (styles/numFmt).
These are real parity gaps but explicitly punted; revisit after the fault-lines are fixed.

---

## Verification protocol (run after each step)

- **Type gate:** `npx tsc -b` (catches unused imports via `noUnusedLocals`; Vitest does NOT type-check).
- **Focused tests:** `npx vitest run src/components/DataGrid` (the grid suite). Add
  `src/components/accountGridColumns.test.tsx` for example-wiring changes.
- **Lint:** `npx eslint <changed files>` — watch for React Compiler rules (`react-hooks/immutability`,
  `react-hooks/refs`, `react-hooks/set-state-in-effect`) that fire in clean hooks but were suppressed
  in DataGrid.tsx (it bails out of compilation via its TanStack `incompatible-library` disables).
- **Theme guard:** `npm run lint:theme` for any color/style change.
- **Full gate (phase boundaries):** `npm run build` (= `tsc -b && vite build`) + `npx vitest run`.
- **Browser check:** focused `npm run dev` pass for visible/layout/interaction changes (Phase C/E).

---

## Gotchas / non-obvious constraints discovered

- **Baseline WAS red, now GREEN:** `aggregation.test.ts` had 2 pre-existing failures
  ("aggregates only columns that declare an aggregate" → `'4%'` vs `'4.0%'`; "handles an empty row
  set" → `''` vs `'—'`), stale after the "number formatting controls" commit. **Fixed in Phase D**
  (`5dd9d80`): null aggregate → `'—'` (code), and the percent test now expects `'4.0%'` (matches the
  cell rendering). The whole suite passes; any failure is now a real regression.
- **React Compiler lint in extracted hooks:** moving imperative effect code OUT of `DataGrid.tsx`
  (which bails compilation) re-activates strict compiler rules. Handled so far:
  `usePinnedColumnOffsets` has a scoped `set-state-in-effect` disable (legit DOM-measurement sync);
  `useGridSelectionFocus` has a scoped `immutability` disable (legit imperative scroll/focus);
  `useGridClipboard` moved its "latest ref" writes from render-phase into an effect
  (StrictMode/concurrent-safe). Expect similar when extracting more.
- **zsh doesn't word-split unquoted vars** — `for f in $files` breaks; use `while read -r f`.
- **Tail-piping vitest hides its exit code** — check `Test Files`/`Tests` lines, not the pipe exit.
- **Theme boundary:** no raw `#hex`/`rgb()`/`hsl()` outside `src/theme/` (enforced by `lint:theme`);
  named utilities like `bg-black/40` slip past the linter — avoid introducing them. Use tokens.
- **Catalog guard:** adding/removing a root-exported component requires a `catalog.ts` entry (or
  `INTERNAL` marking); `catalog.test.ts` + `barrels.test.ts` enforce this.
- **TanStack v8 / react-virtual v3 / dnd-kit** are the engines; Recharts is v3 (coerce Tooltip formatter values).
