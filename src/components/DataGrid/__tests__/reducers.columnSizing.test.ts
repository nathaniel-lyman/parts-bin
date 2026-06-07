import { describe, expect, it } from 'vitest'
import { columnSizingReducer } from '../reducers'
import type { LedgerGridColumn } from '../types'
import type { Account } from '../../../data/types'

const cols: LedgerGridColumn<Account>[] = [
  { id: 'mrr', header: 'MRR', minWidth: 80, maxWidth: 200 },
  { id: 'account', header: 'Account' },
]

describe('columnSizingReducer', () => {
  it('sets the width for a column', () => {
    expect(columnSizingReducer({}, { type: 'RESIZE_COLUMN', id: 'mrr', width: 160 }, cols)).toEqual({ mrr: 160 })
  })

  it('clamps below minWidth', () => {
    expect(columnSizingReducer({}, { type: 'RESIZE_COLUMN', id: 'mrr', width: 40 }, cols).mrr).toBe(80)
  })

  it('clamps above maxWidth', () => {
    expect(columnSizingReducer({}, { type: 'RESIZE_COLUMN', id: 'mrr', width: 999 }, cols).mrr).toBe(200)
  })

  it('falls back to a hard floor of 1px when no minWidth is defined', () => {
    expect(columnSizingReducer({}, { type: 'RESIZE_COLUMN', id: 'account', width: -5 }, cols).account).toBe(1)
  })

  it('RESET_COLUMN_WIDTH drops the column from sizing', () => {
    expect(columnSizingReducer({ mrr: 160, account: 120 }, { type: 'RESET_COLUMN_WIDTH', id: 'mrr' }, cols)).toEqual({ account: 120 })
  })

  it('returns the same reference for unrelated actions', () => {
    const slice = { mrr: 160 }
    expect(columnSizingReducer(slice, { type: 'SET_DENSITY', density: 'standard' }, cols)).toBe(slice)
  })
})

