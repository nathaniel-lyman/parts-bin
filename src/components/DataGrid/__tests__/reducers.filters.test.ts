import { describe, expect, it } from 'vitest'
import { rootReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'

describe('filter slice reducer', () => {
  it('sets and clears one column filter without disturbing the others', () => {
    const segment = rootReducer(DEFAULT_STATE, {
      type: 'SET_COLUMN_FILTER',
      columnId: 'segment',
      value: { operator: 'isAnyOf', value: ['Enterprise'] },
    })
    const next = rootReducer(segment, {
      type: 'SET_COLUMN_FILTER',
      columnId: 'mrr',
      value: { operator: 'greaterThan', value: 10000 },
    })

    expect(next.columnFilters).toHaveLength(2)
    expect(rootReducer(next, { type: 'CLEAR_COLUMN_FILTER', columnId: 'segment' }).columnFilters).toEqual([
      { id: 'mrr', value: { operator: 'greaterThan', value: 10000 } },
    ])
  })

  it('sets the quick global filter', () => {
    expect(rootReducer(DEFAULT_STATE, { type: 'SET_GLOBAL_FILTER', value: 'park' }).globalFilter).toBe('park')
  })
})
