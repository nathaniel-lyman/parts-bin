import { describe, expect, it } from 'vitest'
import { serializeGridQuery, toGridQuery } from '../query'
import { DEFAULT_STATE } from '../state'

describe('GridQuery', () => {
  it('projects only query-relevant state', () => {
    expect(Object.keys(toGridQuery(DEFAULT_STATE))).toEqual(['version', 'scope', 'sorting', 'columnFilters', 'globalFilter', 'pagination'])
    expect(toGridQuery(DEFAULT_STATE).version).toBe(1)
    expect(toGridQuery(DEFAULT_STATE).scope).toBe('page')
    expect(toGridQuery(DEFAULT_STATE, 'allMatching').scope).toBe('allMatching')
  })

  it('serializes object keys stably', () => {
    expect(serializeGridQuery({
      version: 1,
      scope: 'page',
      globalFilter: '',
      sorting: [{ id: 'mrr', desc: true }],
      columnFilters: [],
      pagination: { pageSize: 25, pageIndex: 0 },
    })).toBe(serializeGridQuery({
      version: 1,
      scope: 'page',
      pagination: { pageIndex: 0, pageSize: 25 },
      columnFilters: [],
      sorting: [{ desc: true, id: 'mrr' }],
      globalFilter: '',
    }))
  })
})
