import { describe, expect, it } from 'vitest'
import { gridReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'

describe('pagination slice', () => {
  it('sets pageIndex and preserves pageSize', () => {
    const next = gridReducer(DEFAULT_STATE, { type: 'SET_PAGE_INDEX', pageIndex: 3 })
    expect(next.pagination).toEqual({ pageIndex: 3, pageSize: DEFAULT_STATE.pagination.pageSize })
  })

  it('sets pageSize and resets pageIndex', () => {
    const paged = gridReducer(DEFAULT_STATE, { type: 'SET_PAGE_INDEX', pageIndex: 4 })
    const next = gridReducer(paged, { type: 'SET_PAGE_SIZE', pageSize: 50 })
    expect(next.pagination).toEqual({ pageIndex: 0, pageSize: 50 })
  })

  it('filter changes reset pageIndex', () => {
    const paged = gridReducer(DEFAULT_STATE, { type: 'SET_PAGE_INDEX', pageIndex: 4 })
    expect(gridReducer(paged, { type: 'SET_GLOBAL_FILTER', value: 'cobalt' }).pagination.pageIndex).toBe(0)
    expect(gridReducer(paged, { type: 'SET_COLUMN_FILTERS', columnFilters: [{ id: 'segment', value: 'Enterprise' }] }).pagination.pageIndex).toBe(0)
  })
})
