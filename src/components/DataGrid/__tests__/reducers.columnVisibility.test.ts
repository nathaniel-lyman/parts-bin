import { describe, expect, it } from 'vitest'
import { columnVisibilityReducer, densityReducer } from '../reducers'

const DEFAULT_VIS = { account: true, owner: true, segment: true, mrr: true, growth: true, status: true, arr: false, since: false }

describe('columnVisibilityReducer', () => {
  it('toggles a hideable column off then on', () => {
    const off = columnVisibilityReducer({ arr: true }, { type: 'TOGGLE_COLUMN_VISIBILITY', id: 'arr' })
    expect(off.arr).toBe(false)
    expect(columnVisibilityReducer(off, { type: 'TOGGLE_COLUMN_VISIBILITY', id: 'arr' }).arr).toBe(true)
  })

  it('treats an absent column as currently-visible', () => {
    expect(columnVisibilityReducer({}, { type: 'TOGGLE_COLUMN_VISIBILITY', id: 'since' }).since).toBe(false)
  })

  it('actions-lock: toggling actions is a silent no-op', () => {
    const slice = { account: true }
    expect(columnVisibilityReducer(slice, { type: 'TOGGLE_COLUMN_VISIBILITY', id: 'actions' })).toBe(slice)
  })

  it('SET_COLUMN_VISIBILITY replaces the map and never hides actions', () => {
    const next = columnVisibilityReducer({ arr: false }, { type: 'SET_COLUMN_VISIBILITY', columnVisibility: { arr: true, actions: false } })
    expect(next.arr).toBe(true)
    expect(next.actions).not.toBe(false)
  })

  it('RESET_COLUMNS restores default visibility', () => {
    expect(columnVisibilityReducer({ arr: true, since: true }, { type: 'RESET_COLUMNS' })).toEqual(DEFAULT_VIS)
  })
})

describe('densityReducer', () => {
  it('sets density', () => {
    expect(densityReducer('compact', { type: 'SET_DENSITY', density: 'comfortable' })).toBe('comfortable')
  })

  it('RESET_COLUMNS restores compact', () => {
    expect(densityReducer('comfortable', { type: 'RESET_COLUMNS' })).toBe('compact')
  })

  it('ignores unrelated actions', () => {
    expect(densityReducer('standard', { type: 'TOGGLE_COLUMN_VISIBILITY', id: 'arr' })).toBe('standard')
  })
})

