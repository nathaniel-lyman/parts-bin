import type { Account, Segment, Status } from '../../data/types'
import { makeFilterFn, type FilterColumnType, type FilterValue } from './filtering'
import type { GridQuery } from './query'

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
      id: `gen-${index}`,
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

export interface ServerResult {
  rows: Account[]
  totalRowCount: number
}

export interface MockServerAdapter {
  fetch: (query: GridQuery) => Promise<ServerResult>
}

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
    fetch(query) {
      const filtered = applyQuery(data, query)
      const totalRowCount = filtered.length
      const start = query.pagination.pageIndex * query.pagination.pageSize
      const rows = filtered.slice(start, start + query.pagination.pageSize)
      return new Promise((resolve) => {
        setTimeout(() => resolve({ rows, totalRowCount }), latencyMs)
      })
    },
  }
}
