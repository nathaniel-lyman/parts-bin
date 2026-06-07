import { describe, expect, it } from 'vitest'
import { DEFAULT_STATE, hydrate } from '../state'
import type { LedgerGridState } from '../types'

describe('DEFAULT_STATE', () => {
  it('matches the parity defaults (mrr desc, arr/since hidden, compact, actions right-pinned)', () => {
    expect(DEFAULT_STATE.sorting).toEqual([{ id: 'mrr', desc: true }])
    expect(DEFAULT_STATE.columnVisibility).toEqual({ account: true, arr: false, since: false })
    expect(DEFAULT_STATE.columnOrder).toEqual([
      'account',
      'owner',
      'segment',
      'mrr',
      'growth',
      'status',
      'arr',
      'since',
      'actions',
    ])
    expect(DEFAULT_STATE.columnPinning).toEqual({ left: [], right: ['actions'] })
    expect(DEFAULT_STATE.density).toBe('compact')
    expect(DEFAULT_STATE.pagination).toEqual({ pageIndex: 0, pageSize: 25 })
    expect(DEFAULT_STATE.globalFilter).toBe('')
    expect(DEFAULT_STATE.rowPinning).toEqual({ top: [], bottom: [] })
  })
})

describe('hydrate precedence (persisted over initialState over defaults)', () => {
  it('uncontrolled: persisted view beats initialState beats defaults (per-field merge)', () => {
    const out = hydrate({
      initialState: { density: 'comfortable', pagination: { pageIndex: 0, pageSize: 50 } },
      persisted: { density: 'standard', columnVisibility: { arr: true } },
    })
    expect(out.density).toBe('standard')
    expect(out.pagination.pageSize).toBe(50)
    expect(out.columnVisibility).toEqual({ account: true, arr: true, since: false })
  })

  it('falls back to defaults when neither persisted nor initialState provide a field', () => {
    expect(hydrate({})).toEqual(DEFAULT_STATE)
  })

  it('controlled state (when provided) wins over persisted AND initialState', () => {
    const controlled: LedgerGridState = { ...DEFAULT_STATE, density: 'comfortable', globalFilter: 'live' }
    const out = hydrate({
      controlledState: controlled,
      initialState: { density: 'standard' },
      persisted: { density: 'compact' },
    })
    expect(out.density).toBe('comfortable')
    expect(out.globalFilter).toBe('live')
  })

  it('result is always normalized (actions forced last + right-pinned)', () => {
    const out = hydrate({ persisted: { columnOrder: ['actions', 'owner', 'account'] } })
    expect(out.columnOrder[out.columnOrder.length - 1]).toBe('actions')
    expect(out.columnPinning).toEqual({ left: [], right: ['actions'] })
  })
})

