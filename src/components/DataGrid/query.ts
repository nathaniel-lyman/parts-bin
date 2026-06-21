import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import type { LedgerGridState } from './types'

export const GRID_QUERY_VERSION = 1

export interface GridQuery {
  version: typeof GRID_QUERY_VERSION
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  pagination: { pageIndex: number; pageSize: number }
}

export interface GridQueryContext {
  signal: AbortSignal
  requestId: number
}

export interface DataGridQueryResult<TData> {
  rows: TData[]
  totalRowCount: number
  pageInfo?: {
    hasNextPage?: boolean
    hasPreviousPage?: boolean
    nextCursor?: string
    previousCursor?: string
  }
  meta?: Record<string, unknown>
}

export interface DataGridDataSource<TData> {
  fetch: (query: GridQuery, context: GridQueryContext) => Promise<DataGridQueryResult<TData>>
}

export function toGridQuery(state: Pick<LedgerGridState, 'sorting' | 'columnFilters' | 'globalFilter' | 'pagination'>): GridQuery {
  return {
    version: GRID_QUERY_VERSION,
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
