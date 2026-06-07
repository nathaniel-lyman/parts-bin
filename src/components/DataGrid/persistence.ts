import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { normalizeColumnOrder } from './normalize'
import { DEFAULT_STATE, hydrate } from './state'
import type { Density, LedgerGridState } from './types'

export const GRID_VIEW_VERSION = 1 as const
export const GRID_STORAGE_KEY = 'ledger.accounts.grid'

export interface PersistedGridView {
  version: typeof GRID_VIEW_VERSION
  columnVisibility: Record<string, boolean>
  columnOrder: string[]
  columnSizing: Record<string, number>
  columnPinning: { left: string[]; right: string[] }
  density: Density
  columnFilters: ColumnFiltersState
  sorting: SortingState
  pagination: { pageSize: number }
}

export function project(state: LedgerGridState): PersistedGridView {
  return {
    version: GRID_VIEW_VERSION,
    columnVisibility: state.columnVisibility,
    columnOrder: state.columnOrder,
    columnSizing: state.columnSizing,
    columnPinning: state.columnPinning,
    density: state.density,
    columnFilters: state.columnFilters,
    sorting: state.sorting,
    pagination: { pageSize: state.pagination.pageSize },
  }
}

export function hydrateView(view: Partial<PersistedGridView>): LedgerGridState {
  const { version: _version, pagination, ...rest } = view
  return hydrate({
    persisted: {
      ...rest,
      ...(pagination ? { pagination: { pageIndex: 0, pageSize: pagination.pageSize } } : {}),
    },
  })
}

const LEGACY_COLS_KEY = 'ledger.cols'
const LEGACY_ORDER_KEY = 'ledger.colOrder'

function readLegacy<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

export function migrateLegacy(): PersistedGridView {
  const base = project(DEFAULT_STATE)
  const legacyCols = readLegacy<Partial<Record<'name' | 'arr' | 'since', boolean>>>(LEGACY_COLS_KEY)
  const columnVisibility = { ...DEFAULT_STATE.columnVisibility }

  if (legacyCols) {
    if (typeof legacyCols.name === 'boolean') columnVisibility.account = legacyCols.name
    if (typeof legacyCols.arr === 'boolean') columnVisibility.arr = legacyCols.arr
    if (typeof legacyCols.since === 'boolean') columnVisibility.since = legacyCols.since
  }

  const legacyOrder = readLegacy<unknown>(LEGACY_ORDER_KEY)
  const columnOrder = legacyOrder !== undefined ? normalizeColumnOrder(legacyOrder) : base.columnOrder

  return { ...base, columnVisibility, columnOrder }
}

