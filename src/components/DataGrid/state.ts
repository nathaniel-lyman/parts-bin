import type { LedgerGridState } from './types'
import { normalizeState } from './normalize'

export const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {}

export const DEFAULT_STATE: LedgerGridState = {
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  columnVisibility: {},
  columnOrder: [],
  columnSizing: {},
  columnPinning: { left: [], right: [] },
  rowSelection: {},
  rowPinning: { top: [], bottom: [] },
  pagination: { pageIndex: 0, pageSize: 25 },
  density: 'compact',
  grouping: [],
  expanded: {},
  numberFormats: {},
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
    numberFormats: {
      ...DEFAULT_STATE.numberFormats,
      ...initialState.numberFormats,
      ...persisted.numberFormats,
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
