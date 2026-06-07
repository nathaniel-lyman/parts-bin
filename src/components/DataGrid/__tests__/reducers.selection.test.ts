import { describe, expect, it } from 'vitest'
import { rootReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'

describe('rowSelection slice reducer', () => {
  it('TOGGLE_ROW turns an unselected row on', () => {
    expect(rootReducer(DEFAULT_STATE, { type: 'TOGGLE_ROW', id: 'a1' }).rowSelection).toEqual({ a1: true })
  })

  it('TOGGLE_ROW removes the key when turning a row off', () => {
    const selected = { ...DEFAULT_STATE, rowSelection: { a1: true, a2: true } }
    expect(rootReducer(selected, { type: 'TOGGLE_ROW', id: 'a1' }).rowSelection).toEqual({ a2: true })
  })

  it('SELECT_ALL_VISIBLE selects and deselects exactly the given visible ids', () => {
    const selected = rootReducer(DEFAULT_STATE, { type: 'SELECT_ALL_VISIBLE', ids: ['a1', 'a2'], select: true })
    expect(selected.rowSelection).toEqual({ a1: true, a2: true })
    expect(rootReducer({ ...selected, rowSelection: { ...selected.rowSelection, z9: true } }, {
      type: 'SELECT_ALL_VISIBLE',
      ids: ['a1', 'a2'],
      select: false,
    }).rowSelection).toEqual({ z9: true })
  })

  it('CLEAR_SELECTION empties the slice without mutating input', () => {
    const selected = { ...DEFAULT_STATE, rowSelection: { a1: true } }
    expect(rootReducer(selected, { type: 'CLEAR_SELECTION' }).rowSelection).toEqual({})
    expect(selected.rowSelection).toEqual({ a1: true })
  })
})
