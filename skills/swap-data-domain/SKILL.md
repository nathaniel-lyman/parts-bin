---
name: swap-data-domain
description: Use when replacing the demo accounts/MRR data with your own domain — new entity types, seed data, KPIs, chart series, grid columns, or CRUD forms.
---

# Swap the Data Domain

## Overview

The demo domain is SaaS accounts with MRR metrics. Everything derives from
one pipeline, so swap it **in dependency order** — types first, UI wiring
last — and the KPIs, charts, and grid all follow. Styling never changes
during a domain swap: components stay on token utilities (no raw colors;
`npm run lint:theme` enforces it).

```
data/types.ts → data/accounts.ts → hooks/useAccounts → selectors/metrics
                                        │
                                        └→ grid columns → App.tsx wiring → forms
```

## The pipeline, step by step

1. **`src/data/types.ts`** — redefine the entity. Demo shape: `Account`
   (`id`, `name`, `owner`, `segment`, `mrr`, `growth`, `status`, `arr`,
   `since`) with `Segment` and `Status` unions. The chart point types
   (`MonthlyPoint`, `MovementPoint`) live here too and have segment names
   baked in — update them as well.
2. **`src/data/accounts.ts`** — replace the seed rows (`seedAccounts`, 8 of
   them) and the chart series: `sparks` (four 12-month KPI sparkline arrays),
   `monthlySeries`, `movementSeries`, `revenueWaterfallSeries`.
3. **`src/hooks/useAccounts.ts`** — in-memory CRUD source of truth:
   `{ accounts, create, update, remove }` and `NewAccount = Omit<Account,'id'>`.
   Usually survives a swap with renames only.
4. **`src/selectors/metrics.ts`** — pure derive functions feeding the KPI
   cards and donut. **The demo's status semantics are deliberate; choose
   yours consciously:** `totalMrr` and `segmentShares` exclude `Churned`,
   `activeCount` counts only `Active`, `atRiskCount` counts everything
   non-`Active`, and `avgGrowth` includes `Churned` on purpose (demo
   parity). Decide the equivalent rules for your statuses and pin them with
   tests.
5. **`src/components/accountGridColumns.tsx`** — `buildAccountGridColumns()`
   defines the 9 columns. Keep the `actions` column conventions (fixed
   width, non-sortable, non-reorderable). Column ids are also hardcoded in
   two DataGrid files that **must** change with them:
   - `src/components/DataGrid/normalize.ts` — `DEFAULT_COLUMN_ORDER` (the
     canonical id list), `MOVABLE_COLUMN_IDS`, and `canonicalOrder()`.
   - `src/components/DataGrid/state.ts` — `DEFAULT_STATE.columnVisibility`
     (demo hides `arr`/`since` by default).
   - `src/components/DataGrid/persistence.ts` — `GRID_STORAGE_KEY` and the
     legacy-key migration block reference account-domain ids; update or
     delete the migration when those ids go away.
6. **`src/App.tsx` → `DashboardPage`** — the wiring: four `KpiCard`s fed by
   the selectors + `sparks`, `MrrShareDonut`, the charts, and the `DataGrid`
   with `persistenceKey='ledger.accounts.grid'`. If the column set changes
   meaningfully, bump the persistence key so stale saved layouts don't
   resurrect old columns.
7. **`src/components/AccountFormModal.tsx`** + **`ConfirmDialog.tsx`** — the
   CRUD forms. Update fields and any derived values (demo: `arr = mrr * 12`,
   `since` defaults to today).
8. **Update the colocated tests as you touch each layer** — they pin the
   semantics you chose in step 4: `src/selectors/metrics.test.ts`,
   `src/hooks/useAccounts.test.tsx`,
   `src/components/accountGridColumns.test.tsx`,
   `src/components/AccountFormModal.test.tsx`, `src/App.test.tsx`.

Renaming files/hooks (`useAccounts` → `useOrders`, …) is optional polish; the
swap works with the original names. Global grid search matches name **and**
owner (`accountGlobalFilter`) — re-point it at your domain's searchable fields.

## Verify

Follow `skills/verify-changes/SKILL.md` — all gates. The build (`tsc -b`)
will surface every wiring point you missed after a type change; that's the
fastest way to find stragglers.

## Common mistakes

| Mistake | Fix |
|---|---|
| Started in App.tsx, working backwards | Go types-first; `npm run build` then lists every downstream break |
| Copied status-exclusion rules blindly | They're domain decisions (step 4) — choose and pin with tests |
| New columns missing from the grid | Add ids to `DEFAULT_COLUMN_ORDER` (`normalize.ts`) and visibility (`state.ts`), not just the column defs |
| Old grid layout reappears after swap | Bump the `persistenceKey` (stale localStorage view) |
| Seed data changed, sparklines didn't | `sparks`/series in `data/accounts.ts` are separate from the rows |
