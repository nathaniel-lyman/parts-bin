# DataGrid → AG Grid Parity & Polish — Master Plan

> **Purpose:** Resumable roadmap for bringing `src/components/DataGrid/` up to premium AG Grid
> Enterprise polish. This doc is self-contained — a fresh session can pick up from here.
> **Branch:** `datagrid-aggrid-polish` (off `main`). **Started:** 2026-06-21.

---

## How to resume (read first)

1. `git checkout datagrid-aggrid-polish` and `git log --oneline` to see progress.
2. Re-read the **Status snapshot** below for what's done / in flight / next.
3. Verification protocol is at the bottom — run the focused gate after each step.
4. **Baseline is RED by 2 tests** (pre-existing, not ours) — see Gotchas. Hold the line at
   exactly those 2 failures; any other failure is a regression we introduced.

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
| **A — Foundation refactor** | 🟡 in progress | hook extraction ✅, Ledger codemod ✅, barrel narrowing ⏳, 'actions' id refactor ⏳ |
| **B — Render-layer memoization** | ⬜ not started | now ALSO owns `GridRuntimeContext` (re-sequenced from A) |
| **C — Interaction polish** | ⬜ not started | |
| **D — Correctness + filter depth** | ⬜ not started | includes fixing the 2 pre-existing aggregation tests |
| **E — Accessibility / ARIA pass** | ⬜ not started | |

### Commits on the branch so far
- `07f5b37` — extract god-component into six hooks (DataGrid.tsx 1310 → 898 lines)
- `16f8d58` — drop deprecated `Ledger*` type aliases for canonical `DataGrid*` (~25 files)

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

### Phase A — remaining
1. **Barrel narrowing** (`src/components/DataGrid/index.ts`): drop the composition-internal
   re-exports (`DataGridHeader/Body/Row/Cell/SelectionCell/ColumnDragOverlay`) so their prop
   signatures can be reshaped in Phase B without a "public" break.
   - **Ripple to handle:** `src/components/catalog.ts` lists these as INTERNAL (`['DataGridHeader',
     'Composed by DataGrid'], …` ~lines 95-102). `catalog.test.ts` requires every root-exported
     component to be cataloged or `INTERNAL`. Root barrel `src/components/index.ts` does
     `export * from './DataGrid'`. Check `barrels.test.ts` + `catalog.test.ts` assertions before/after.
   - Likely keep `DataGridToolbar`/`DataGridFooter` exported (standalone-usable). Confirm.
2. **`'actions'` magic column-id → capability flags** (review architecture finding): `ACTIONS_COLUMN_ID`
   in `normalize.ts` is special-cased across ~10 modules (normalize, reducers, DataGrid, DataGridCell,
   DataGridRow, accountGridColumns). Replace with per-column capability flags
   (`lockPosition: 'last'`, `suppressMovable`, `lockPinned`) derived in `normalize`. Medium effort,
   ~10 files, behavior-preserving. Also fold in `RESET_COLUMNS` hard-coding cleanup
   (reducers embed account-grid presets like `density: 'compact'`, `right: ['actions']`).

### Re-sequencing note
`GridRuntimeContext` was originally Phase A but **moved into Phase B** — its only payoff is making
`DataGridRow`/`DataGridCell` memoizable, which *is* Phase B. Doing it in A would refactor the render
chain twice. No scope dropped.

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

- **Baseline is RED:** `aggregation.test.ts` has **2 pre-existing failures** on a clean checkout
  ("aggregates only columns that declare an aggregate" → `'4%'` vs `'4.0%'`; "handles an empty row
  set" → `''` vs `'—'`). Stale after the "number formatting controls" commit. **Phase D fixes them.**
  Until then, the success criterion is "exactly 2 failures, no more."
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
