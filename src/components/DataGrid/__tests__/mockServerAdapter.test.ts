import { describe, expect, it } from 'vitest'
import { createMemoryServerAdapter, createMockServerAdapter, generateAccounts } from '../mockServerAdapter'
import type { DataGridColumn } from '../types'

const baseQuery = {
  version: 1 as const,
  scope: 'page' as const,
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 10 },
}

describe('mockServerAdapter', () => {
  it('generates account-shaped rows', () => {
    const rows = generateAccounts(3)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ id: 'row-0', segment: 'Enterprise', status: 'Active' })
  })

  it('generates 10k stable unique rows for the virtualization smoke path', () => {
    const rows = generateAccounts(10_000)
    expect(rows).toHaveLength(10_000)
    expect(rows[0].id).toBe('row-0')
    expect(rows[9_999].id).toBe('row-9999')
    expect(new Set(rows.map((row) => row.id))).toHaveLength(10_000)
  })

  it('applies global filter, column filters, sorting, and pagination', async () => {
    const rows = generateAccounts(30)
    const adapter = createMockServerAdapter(rows, { latencyMs: 0 })
    const result = await adapter.fetch({
      ...baseQuery,
      globalFilter: 'k. osei',
      columnFilters: [{ id: 'segment', value: { operator: 'isAnyOf', value: ['Enterprise'] } }],
      sorting: [{ id: 'mrr', desc: true }],
      pagination: { pageIndex: 0, pageSize: 2 },
    }, { signal: new AbortController().signal, requestId: 1 })

    expect(result.totalRowCount).toBeGreaterThan(2)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].mrr).toBeGreaterThanOrEqual(result.rows[1].mrr)
    expect(result.rows.every((row) => row.owner === 'K. Osei' && row.segment === 'Enterprise')).toBe(true)
  })

  it('builds a generic memory adapter from DataGrid column definitions', async () => {
    interface Row { id: string; title: string; score: number; status: string }
    const columns: DataGridColumn<Row>[] = [
      { id: 'title', accessorKey: 'title', header: 'Title', type: 'text' },
      { id: 'score', accessorKey: 'score', header: 'Score', type: 'number' },
      { id: 'status', accessorKey: 'status', header: 'Status', type: 'status' },
    ]
    const adapter = createMemoryServerAdapter<Row>([
      { id: 'r1', title: 'Alpha', score: 4, status: 'Open' },
      { id: 'r2', title: 'Beta', score: 9, status: 'Done' },
      { id: 'r3', title: 'Gamma', score: 7, status: 'Open' },
    ], { columns, latencyMs: 0, globalFilterColumns: ['title'] })

    const result = await adapter.fetch({
      ...baseQuery,
      globalFilter: 'a',
      columnFilters: [{ id: 'status', value: { operator: 'is', value: 'Open' } }],
      sorting: [{ id: 'score', desc: true }],
      pagination: { pageIndex: 0, pageSize: 1 },
    }, { signal: new AbortController().signal, requestId: 1 })

    expect(result.totalRowCount).toBe(2)
    expect(result.rows).toEqual([{ id: 'r3', title: 'Gamma', score: 7, status: 'Open' }])
  })
})
