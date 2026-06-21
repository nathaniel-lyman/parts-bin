import { describe, expect, it } from 'vitest'
import { gridReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'
import type { DataGridState } from '../types'

const base: DataGridState = { ...DEFAULT_STATE }

describe('grouping reducers', () => {
  it('TOGGLE_GROUP_BY adds a column and expands everything', () => {
    const next = gridReducer(base, { type: 'TOGGLE_GROUP_BY', columnId: 'segment' })
    expect(next.grouping).toEqual(['segment'])
    expect(next.expanded).toBe(true)
    expect(next.pagination.pageIndex).toBe(0)
  })

  it('TOGGLE_GROUP_BY removes an already-grouped column and resets expansion', () => {
    const grouped = gridReducer(base, { type: 'TOGGLE_GROUP_BY', columnId: 'segment' })
    const next = gridReducer(grouped, { type: 'TOGGLE_GROUP_BY', columnId: 'segment' })
    expect(next.grouping).toEqual([])
    expect(next.expanded).toEqual({})
  })

  it('TOGGLE_GROUP_BY supports multi-level grouping in toggle order', () => {
    const one = gridReducer(base, { type: 'TOGGLE_GROUP_BY', columnId: 'segment' })
    const two = gridReducer(one, { type: 'TOGGLE_GROUP_BY', columnId: 'status' })
    expect(two.grouping).toEqual(['segment', 'status'])
  })

  it('ignores grouping by the actions column', () => {
    const next = gridReducer(base, { type: 'TOGGLE_GROUP_BY', columnId: 'actions' })
    expect(next.grouping).toEqual([])
  })

  it('SET_GROUPING replaces grouping wholesale', () => {
    const next = gridReducer(base, { type: 'SET_GROUPING', grouping: ['status', 'segment'] })
    expect(next.grouping).toEqual(['status', 'segment'])
    expect(next.expanded).toBe(true)
  })

  it('CLEAR_GROUPING empties grouping and expansion', () => {
    const grouped = gridReducer(base, { type: 'SET_GROUPING', grouping: ['segment'] })
    const next = gridReducer(grouped, { type: 'CLEAR_GROUPING' })
    expect(next.grouping).toEqual([])
    expect(next.expanded).toEqual({})
  })

  it('SET_EXPANDED stores per-group expansion', () => {
    const next = gridReducer(base, { type: 'SET_EXPANDED', expanded: { 'segment:Startup': true } })
    expect(next.expanded).toEqual({ 'segment:Startup': true })
  })

  it('EXPAND_ALL and COLLAPSE_ALL control expanded state globally', () => {
    expect(gridReducer(base, { type: 'EXPAND_ALL' }).expanded).toBe(true)
    expect(gridReducer({ ...base, expanded: true }, { type: 'COLLAPSE_ALL' }).expanded).toEqual({})
  })

  it('RESET_COLUMNS clears grouping along with the column slices', () => {
    const grouped = gridReducer(base, { type: 'TOGGLE_GROUP_BY', columnId: 'segment' })
    const next = gridReducer(grouped, { type: 'RESET_COLUMNS' })
    expect(next.grouping).toEqual([])
    expect(next.expanded).toEqual({})
  })
})
