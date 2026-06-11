import { DEFAULT_COLUMN_ORDER, normalizeState } from './normalize'
import type { LedgerGridState } from './types'

export const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  account: true,
  owner: true,
  segment: true,
  mrr: true,
  growth: true,
  status: true,
  arr: false,
  since: false,
}

export const DEFAULT_STATE: LedgerGridState = {
  sorting: [{ id: 'mrr', desc: true }],
  columnFilters: [],
  globalFilter: '',
  columnVisibility: { account: true, arr: false, since: false },
  columnOrder: [...DEFAULT_COLUMN_ORDER],
  columnSizing: {},
  columnPinning: { left: [], right: ['actions'] },
  rowSelection: {},
  rowPinning: { top: [], bottom: [] },
  pagination: { pageIndex: 0, pageSize: 25 },
  density: 'compact',
  grouping: [],
  expanded: {},
}

export interface HydrateOptions {
  controlledState?: LedgerGridState
  initialState?: Partial<LedgerGridState>
  persisted?: Partial<LedgerGridState>
}

function mergeLayers(
  initialState: Partial<LedgerGridState>,
  persisted: Partial<LedgerGridState>,
): LedgerGridState {
  return {
    ...DEFAULT_STATE,
    ...initialState,
    ...persisted,
    columnVisibility: {
      ...DEFAULT_STATE.columnVisibility,
      ...initialState.columnVisibility,
      ...persisted.columnVisibility,
    },
    columnSizing: {
      ...DEFAULT_STATE.columnSizing,
      ...initialState.columnSizing,
      ...persisted.columnSizing,
    },
    columnPinning: {
      ...DEFAULT_STATE.columnPinning,
      ...initialState.columnPinning,
      ...persisted.columnPinning,
    },
    pagination: {
      ...DEFAULT_STATE.pagination,
      ...initialState.pagination,
      ...persisted.pagination,
    },
  }
}

export function hydrate(opts: HydrateOptions): LedgerGridState {
  if (opts.controlledState) return normalizeState(opts.controlledState)
  return normalizeState(mergeLayers(opts.initialState ?? {}, opts.persisted ?? {}))
}
