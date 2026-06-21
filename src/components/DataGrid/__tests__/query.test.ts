import { describe, expect, it } from 'vitest'
import { serializeGridQuery, toGridQuery } from '../query'
import { DEFAULT_STATE } from '../state'

describe('GridQuery', () => {
  it('projects only query-relevant state', () => {
    expect(Object.keys(toGridQuery(DEFAULT_STATE))).toEqual(['version', 'sorting', 'columnFilters', 'globalFilter', 'pagination'])
    expect(toGridQuery(DEFAULT_STATE).version).toBe(1)
  })

  it('serializes object keys stably', () => {
    expect(serializeGridQuery({
      version: 1,
      globalFilter: '',
      sorting: [{ id: 'mrr', desc: true }],
      columnFilters: [],
      pagination: { pageSize: 25, pageIndex: 0 },
    })).toBe(serializeGridQuery({
      version: 1,
      pagination: { pageIndex: 0, pageSize: 25 },
      columnFilters: [],
      sorting: [{ desc: true, id: 'mrr' }],
      globalFilter: '',
    }))
  })
})
