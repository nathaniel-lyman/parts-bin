import { describe, expect, it } from 'vitest'
import { createMemoryServerAdapter } from '../memoryServerAdapter'
import type { DataGridColumn } from '../types'

const baseQuery = {
  version: 1 as const,
  scope: 'page' as const,
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 10 },
}

describe('memoryServerAdapter', () => {
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
