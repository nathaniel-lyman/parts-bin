import { makeFilterFn, type FilterColumnType, type FilterValue } from './filtering'
import type { DataGridDataSource, GridQuery, GridQueryContext } from './query'
import type { DataGridColumn } from './types'

export interface MemoryServerAdapterOptions<TData> {
  columns: DataGridColumn<TData>[]
  latencyMs?: number
  globalFilterColumns?: string[]
}

function valueFor<TData>(row: TData, column: DataGridColumn<TData>): unknown {
  if (column.accessorFn) return column.accessorFn(row)
  if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey as string]
  return undefined
}

function typeFor<TData>(column: DataGridColumn<TData> | undefined): FilterColumnType {
  if (!column) return 'text'
  if (column.meta?.type) return column.meta.type
  if (column.type === 'number' || column.type === 'currency' || column.type === 'percent' || column.type === 'date' || column.type === 'status') {
    return column.type
  }
  return 'text'
}

function applyMemoryQuery<TData>(all: TData[], columns: DataGridColumn<TData>[], query: GridQuery, globalFilterColumns?: string[]): TData[] {
  const byId = new Map(columns.map((column) => [column.id, column]))
  const searchable = globalFilterColumns?.length
    ? globalFilterColumns.map((id) => byId.get(id)).filter((column): column is DataGridColumn<TData> => column !== undefined)
    : columns.filter((column) => column.type !== 'actions' && column.exportable !== false)
  let rows = all

  if (query.globalFilter.trim()) {
    const needle = query.globalFilter.toLowerCase()
    rows = rows.filter((row) => searchable.some((column) => String(valueFor(row, column) ?? '').toLowerCase().includes(needle)))
  }

  for (const filter of query.columnFilters) {
    const column = byId.get(filter.id)
    const value = filter.value as FilterValue
    if (!column || !value || typeof value !== 'object') continue
    const predicate = makeFilterFn(typeFor(column), value.operator, value.value)
    rows = rows.filter((row) => predicate(valueFor(row, column)))
  }

  if (query.sorting.length) {
    rows = [...rows].sort((a, b) => {
      for (const sort of query.sorting) {
        const column = byId.get(sort.id)
        const av = column ? valueFor(a, column) : undefined
        const bv = column ? valueFor(b, column) : undefined
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''))
        if (cmp !== 0) return sort.desc ? -cmp : cmp
      }
      return 0
    })
  }

  return rows
}

export function createMemoryServerAdapter<TData>(
  data: TData[],
  opts: MemoryServerAdapterOptions<TData>,
): DataGridDataSource<TData> {
  const latencyMs = opts.latencyMs ?? 250
  return {
    fetch(query: GridQuery, context: GridQueryContext) {
      const filtered = applyMemoryQuery(data, opts.columns, query, opts.globalFilterColumns)
      const totalRowCount = filtered.length
      const start = query.pagination.pageIndex * query.pagination.pageSize
      const rows = filtered.slice(start, start + query.pagination.pageSize)
      return new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ rows, totalRowCount }), latencyMs)
        context.signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
      })
    },
  }
}
