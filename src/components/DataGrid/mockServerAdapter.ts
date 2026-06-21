import type { Account, Segment, Status } from '../../data/types'
import { makeFilterFn, type FilterColumnType, type FilterValue } from './filtering'
import type { DataGridDataSource, DataGridQueryResult, GridQuery, GridQueryContext } from './query'
import type { DataGridColumn } from './types'

const SEGMENTS: Segment[] = ['Enterprise', 'Mid-market', 'Startup']
const STATUSES: Status[] = ['Active', 'At risk', 'Churned']
const OWNERS = ['K. Osei', 'J. Park', 'M. Chen', 'A. Rivera', 'L. Mori', 'D. Vance']
const NAME_A = ['Cobalt', 'Meridian', 'Northwind', 'Bluestem', 'Harbor', 'Solstice', 'Foxglove', 'Quill', 'Cedar', 'Atlas']
const NAME_B = ['Freight', 'Corp', 'Paper', 'Health', 'Pine', 'Media', 'Labs', 'Analytics', 'Systems', 'Group']

const COLUMN_TYPES: Record<string, FilterColumnType> = {
  account: 'text',
  owner: 'text',
  segment: 'enum',
  mrr: 'currency',
  growth: 'percent',
  status: 'status',
  arr: 'currency',
  since: 'date',
}

const CELL_OF: Record<string, (account: Account) => unknown> = {
  account: (account) => account.name,
  owner: (account) => account.owner,
  segment: (account) => account.segment,
  mrr: (account) => account.mrr,
  growth: (account) => account.growth,
  status: (account) => account.status,
  arr: (account) => account.arr,
  since: (account) => account.since,
}

function seeded(index: number): number {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export function generateAccounts(count: number): Account[] {
  const rows: Account[] = []
  for (let index = 0; index < count; index++) {
    const r = seeded(index)
    const mrr = Math.round(500 + r * 30000)
    rows.push({
      id: `row-${index}`,
      name: `${NAME_A[index % NAME_A.length]} ${NAME_B[(index * 7) % NAME_B.length]} ${index}`,
      owner: OWNERS[index % OWNERS.length],
      segment: SEGMENTS[index % SEGMENTS.length],
      mrr,
      growth: Math.round((seeded(index + 1) * 60 - 20) * 10) / 10,
      status: STATUSES[index % STATUSES.length],
      arr: mrr * 12,
      since: `20${20 + (index % 5)}-0${1 + (index % 9)}-01`,
    })
  }
  return rows
}

export type ServerResult = DataGridQueryResult<Account>

export type MockServerAdapter = DataGridDataSource<Account>

function matchesGlobal(account: Account, query: string): boolean {
  if (!query) return true
  const needle = query.toLowerCase()
  return account.name.toLowerCase().includes(needle) || account.owner.toLowerCase().includes(needle)
}

function applyQuery(all: Account[], query: GridQuery): Account[] {
  let rows = all.filter((account) => matchesGlobal(account, query.globalFilter))
  for (const filter of query.columnFilters) {
    const type = COLUMN_TYPES[filter.id] ?? 'text'
    const value = filter.value as FilterValue
    if (!value || typeof value !== 'object') continue
    const predicate = makeFilterFn(type, value.operator, value.value)
    const cell = CELL_OF[filter.id] ?? (() => undefined)
    rows = rows.filter((account) => predicate(cell(account)))
  }
  if (query.sorting.length) {
    rows = [...rows].sort((a, b) => {
      for (const sort of query.sorting) {
        const av = CELL_OF[sort.id]?.(a)
        const bv = CELL_OF[sort.id]?.(b)
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

export function createMockServerAdapter(data: Account[], opts: { latencyMs?: number } = {}): MockServerAdapter {
  const latencyMs = opts.latencyMs ?? 250
  return {
    fetch(query, context) {
      const filtered = applyQuery(data, query)
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
