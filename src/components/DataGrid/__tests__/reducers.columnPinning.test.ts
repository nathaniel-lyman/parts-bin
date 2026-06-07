import { describe, expect, it } from 'vitest'
import { columnPinningReducer } from '../reducers'

const base = { left: [] as string[], right: ['actions'] }

describe('columnPinningReducer', () => {
  it('pins a column left and removes it from right', () => {
    const next = columnPinningReducer({ left: [], right: ['actions', 'mrr'] }, { type: 'PIN_COLUMN', id: 'mrr', side: 'left' })
    expect(next.left).toEqual(['mrr'])
    expect(next.right).toEqual(['actions'])
  })

  it('pins a column right', () => {
    const next = columnPinningReducer(base, { type: 'PIN_COLUMN', id: 'mrr', side: 'right' })
    expect(next.right).toContain('mrr')
    expect(next.right).toContain('actions')
  })

  it('unpins a column from left', () => {
    expect(columnPinningReducer({ left: ['account'], right: ['actions'] }, { type: 'UNPIN_COLUMN', id: 'account' }).left).toEqual([])
  })

  it('actions-lock: PIN_COLUMN actions left is a no-op', () => {
    const next = columnPinningReducer(base, { type: 'PIN_COLUMN', id: 'actions', side: 'left' })
    expect(next.left).not.toContain('actions')
    expect(next.right).toContain('actions')
  })

  it('actions-lock: UNPIN_COLUMN actions is a no-op', () => {
    expect(columnPinningReducer(base, { type: 'UNPIN_COLUMN', id: 'actions' }).right).toContain('actions')
  })

  it('does not duplicate when pinning an already-pinned column to the same side', () => {
    expect(columnPinningReducer({ left: ['mrr'], right: ['actions'] }, { type: 'PIN_COLUMN', id: 'mrr', side: 'left' }).left).toEqual(['mrr'])
  })

  it('RESET_COLUMNS restores default pinning', () => {
    expect(columnPinningReducer({ left: ['account'], right: ['actions', 'mrr'] }, { type: 'RESET_COLUMNS' })).toEqual({ left: [], right: ['actions'] })
  })
})

