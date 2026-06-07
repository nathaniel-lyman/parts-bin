import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import type { LedgerGridState } from './types'

export interface GridQuery {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: { pageIndex: number; pageSize: number }
}

export function toGridQuery(state: Pick<LedgerGridState, 'sorting' | 'columnFilters' | 'globalFilter' | 'pagination'>): GridQuery {
  return {
    sorting: state.sorting,
    columnFilters: state.columnFilters,
    globalFilter: state.globalFilter,
    pagination: { pageIndex: state.pagination.pageIndex, pageSize: state.pagination.pageSize },
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const keys = Object.keys(record).sort()
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

export function serializeGridQuery(query: GridQuery): string {
  return stableStringify(query)
}

