import { describe, expect, it } from 'vitest'
import { columnOrderReducer } from '../reducers'

const ORDER = ['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']

describe('columnOrderReducer', () => {
  it('moves a movable column before another and re-normalizes', () => {
    expect(columnOrderReducer(ORDER, { type: 'REORDER_COLUMN', activeId: 'owner', overId: 'account' })).toEqual([
      'owner',
      'account',
      'segment',
      'mrr',
      'growth',
      'status',
      'arr',
      'since',
      'actions',
    ])
  })

  it('is a no-op when activeId === overId', () => {
    expect(columnOrderReducer(ORDER, { type: 'REORDER_COLUMN', activeId: 'mrr', overId: 'mrr' })).toEqual(ORDER)
  })

  it('is a no-op when trying to move the actions column', () => {
    expect(columnOrderReducer(ORDER, { type: 'REORDER_COLUMN', activeId: 'actions', overId: 'account' })).toEqual(ORDER)
  })

  it('is a no-op when trying to drop another column onto actions', () => {
    expect(columnOrderReducer(ORDER, { type: 'REORDER_COLUMN', activeId: 'owner', overId: 'actions' })).toEqual(ORDER)
  })

  it('RESET_COLUMNS restores the default order', () => {
    const scrambled = ['since', 'arr', 'owner', 'account', 'segment', 'mrr', 'growth', 'status', 'actions']
    expect(columnOrderReducer(scrambled, { type: 'RESET_COLUMNS' })).toEqual(ORDER)
  })
})

