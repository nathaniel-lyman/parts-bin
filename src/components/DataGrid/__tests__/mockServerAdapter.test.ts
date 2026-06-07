import { describe, expect, it } from 'vitest'
import { createMockServerAdapter, generateAccounts } from '../mockServerAdapter'

const baseQuery = {
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

  it('applies global filter, column filters, sorting, and pagination', async () => {
    const rows = generateAccounts(30)
    const adapter = createMockServerAdapter(rows, { latencyMs: 0 })
    const result = await adapter.fetch({
      ...baseQuery,
      globalFilter: 'k. osei',
      columnFilters: [{ id: 'segment', value: { operator: 'isAnyOf', value: ['Enterprise'] } }],
      sorting: [{ id: 'mrr', desc: true }],
      pagination: { pageIndex: 0, pageSize: 2 },
    })

    expect(result.totalRowCount).toBeGreaterThan(2)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].mrr).toBeGreaterThanOrEqual(result.rows[1].mrr)
    expect(result.rows.every((row) => row.owner === 'K. Osei' && row.segment === 'Enterprise')).toBe(true)
  })
})
