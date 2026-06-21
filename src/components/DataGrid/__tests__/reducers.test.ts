import { describe, expect, it } from 'vitest'
import { gridReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'

const accountColumns = ['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']
  .map((id) => ({ id, header: id }))

describe('gridReducer - sorting slice', () => {
  it('SET_SORTING replaces the sorting slice', () => {
    const next = gridReducer(DEFAULT_STATE, { type: 'SET_SORTING', sorting: [{ id: 'growth', desc: false }] })
    expect(next.sorting).toEqual([{ id: 'growth', desc: false }])
  })
})

describe('gridReducer - globalFilter slice', () => {
  it('SET_GLOBAL_FILTER replaces the globalFilter slice', () => {
    const next = gridReducer(DEFAULT_STATE, { type: 'SET_GLOBAL_FILTER', value: 'acme' })
    expect(next.globalFilter).toBe('acme')
  })
})

describe('gridReducer - columnVisibility slice (re-normalized)', () => {
  it('SET_COLUMN_VISIBILITY flips a column', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'SET_COLUMN_VISIBILITY',
      columnVisibility: { account: true, arr: true, since: false },
    })
    expect(next.columnVisibility.arr).toBe(true)
  })

  it('attempting to hide actions is a no-op (normalize re-coerces visible)', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'SET_COLUMN_VISIBILITY',
      columnVisibility: { ...DEFAULT_STATE.columnVisibility, actions: false },
    }, accountColumns)
    expect(next.columnVisibility.actions).toBe(true)
  })
})

describe('gridReducer - columnOrder slice (re-normalized)', () => {
  it('SET_COLUMN_ORDER reorders movable columns', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'SET_COLUMN_ORDER',
      columnOrder: ['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'],
    }, accountColumns)
    expect(next.columnOrder.slice(0, 2)).toEqual(['owner', 'account'])
  })

  it('moving actions out of last position is a no-op (normalize forces it last)', () => {
    const next = gridReducer(DEFAULT_STATE, {
      type: 'SET_COLUMN_ORDER',
      columnOrder: ['actions', 'owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since'],
    }, accountColumns)
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

describe('gridReducer - numberFormats slice', () => {
  it('sets and clears a column number format override', () => {
    const formatted = gridReducer(DEFAULT_STATE, {
      type: 'SET_COLUMN_NUMBER_FORMAT',
      columnId: 'mrr',
      format: { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 },
    }, accountColumns)

    expect(formatted.numberFormats.mrr).toEqual({ style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

    const cleared = gridReducer(formatted, { type: 'CLEAR_COLUMN_NUMBER_FORMAT', columnId: 'mrr' }, accountColumns)
    expect(cleared.numberFormats.mrr).toBeUndefined()
  })

  it('RESET_COLUMNS clears number format overrides', () => {
    const state = {
      ...DEFAULT_STATE,
      numberFormats: { mrr: { style: 'currency' as const, currency: 'EUR' } },
    }
    const next = gridReducer(state, { type: 'RESET_COLUMNS' }, accountColumns)
    expect(next.numberFormats).toEqual({})
  })
})
