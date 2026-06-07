import { describe, expect, it } from 'vitest'
import { gridReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'

describe('gridReducer - sorting slice', () => {
  it('setSorting replaces the sorting slice', () => {
    const next = gridReducer(DEFAULT_STATE, { type: 'setSorting', sorting: [{ id: 'growth', desc: false }] })
    expect(next.sorting).toEqual([{ id: 'growth', desc: false }])
  })
})

describe('gridReducer - globalFilter slice', () => {
  it('setGlobalFilter replaces the globalFilter slice', () => {
    const next = gridReducer(DEFAULT_STATE, { type: 'setGlobalFilter', globalFilter: 'acme' })
    expect(next.globalFilter).toBe('acme')
  })
})

describe('gridReducer - columnVisibility slice (re-normalized)', () => {
  it('setColumnVisibility flips a column', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'setColumnVisibility',
      columnVisibility: { account: true, arr: true, since: false },
    })
    expect(next.columnVisibility.arr).toBe(true)
  })

  it('attempting to hide actions is a no-op (normalize re-coerces visible)', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'setColumnVisibility',
      columnVisibility: { ...DEFAULT_STATE.columnVisibility, actions: false },
    })
    expect(next.columnVisibility.actions).toBe(true)
  })
})

describe('gridReducer - columnOrder slice (re-normalized)', () => {
  it('setColumnOrder reorders movable columns', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'setColumnOrder',
      columnOrder: ['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'],
    })
    expect(next.columnOrder.slice(0, 2)).toEqual(['owner', 'account'])
  })

  it('moving actions out of last position is a no-op (normalize forces it last)', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'setColumnOrder',
      columnOrder: ['actions', 'owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since'],
    })
    expect(next.columnOrder[next.columnOrder.length - 1]).toBe('actions')
    expect(next.columnOrder).toEqual(['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'])
  })
})

describe('gridReducer - rowPinning slice', () => {
  it('pins rows to top and bottom without duplicates', () => {
    const top = gridReducer(DEFAULT_STATE, { type: 'PIN_ROW_TOP', rowId: 'row-0' })
    const topAgain = gridReducer(top, { type: 'PIN_ROW_TOP', rowId: 'row-0' })
    const bottom = gridReducer(topAgain, { type: 'PIN_ROW_BOTTOM', rowId: 'row-0' })

    expect(topAgain.rowPinning).toEqual({ top: ['row-0'], bottom: [] })
    expect(bottom.rowPinning).toEqual({ top: [], bottom: ['row-0'] })
  })

  it('unpins rows from both edges without touching layout slices', () => {
    let state = gridReducer(DEFAULT_STATE, { type: 'PIN_ROW_TOP', rowId: 'row-0' })
    state = gridReducer(state, { type: 'PIN_ROW_BOTTOM', rowId: 'row-1' })
    const next = gridReducer(state, { type: 'UNPIN_ROW', rowId: 'row-0' })

    expect(next.rowPinning).toEqual({ top: [], bottom: ['row-1'] })
    expect(next.columnOrder).toEqual(DEFAULT_STATE.columnOrder)
    expect(next.columnPinning).toEqual(DEFAULT_STATE.columnPinning)
    expect(next.sorting).toEqual(DEFAULT_STATE.sorting)
  })
})
