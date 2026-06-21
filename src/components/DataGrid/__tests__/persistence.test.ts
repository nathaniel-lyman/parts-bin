import { describe, expect, it } from 'vitest'
import { GRID_VIEW_VERSION, hydrateView, migrateLegacy, project } from '../persistence'
import { DEFAULT_STATE } from '../state'

describe('project (DataGridState -> PersistedGridView)', () => {
  const live = {
    ...DEFAULT_STATE,
    globalFilter: 'acme',
    rowSelection: { a: true },
    rowPinning: { top: ['a'], bottom: ['b'] },
    pagination: { pageIndex: 4, pageSize: 50 },
    density: 'standard' as const,
    columnVisibility: { account: true, arr: true, since: false },
    sorting: [{ id: 'mrr', desc: true }],
    numberFormats: { mrr: { style: 'currency' as const, currency: 'EUR', maximumFractionDigits: 2 } },
  }

  it('stamps the current version', () => {
    expect(project(live).version).toBe(GRID_VIEW_VERSION)
  })

  it('drops globalFilter, rowSelection, rowPinning entirely', () => {
    const view = project(live) as unknown as Record<string, unknown>
    expect('globalFilter' in view).toBe(false)
    expect('rowSelection' in view).toBe(false)
    expect('rowPinning' in view).toBe(false)
  })

  it('persists pageSize only, drops pageIndex', () => {
    const view = project(live)
    expect(view.pagination).toEqual({ pageSize: 50 })
    expect((view.pagination as Record<string, unknown>).pageIndex).toBeUndefined()
  })

  it('carries durable layout fields through', () => {
    const view = project(live)
    expect(view.density).toBe('standard')
    expect(view.columnVisibility).toEqual({ account: true, arr: true, since: false })
    expect(view.sorting).toEqual([{ id: 'mrr', desc: true }])
    expect(view.numberFormats).toEqual({ mrr: { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 } })
  })
})

describe('hydrateView (PersistedGridView -> DataGridState)', () => {
  it('merges a partial payload over defaults and seeds runtime fields', () => {
    const state = hydrateView({ density: 'comfortable', columnVisibility: { arr: true } })
    expect(state.columnVisibility).toEqual({ arr: true })
    expect(state.density).toBe('comfortable')
    expect(state.globalFilter).toBe('')
    expect(state.rowSelection).toEqual({})
    expect(state.rowPinning).toEqual({ top: [], bottom: [] })
    expect(state.pagination.pageIndex).toBe(0)
  })

  it('hydrates number format overrides', () => {
    const state = hydrateView({ numberFormats: { growth: { style: 'percent', minimumFractionDigits: 2 } } })
    expect(state.numberFormats.growth).toEqual({ style: 'percent', minimumFractionDigits: 2 })
  })

  it('persists pageSize through but resets pageIndex to 0', () => {
    expect(hydrateView({ pagination: { pageSize: 50 } }).pagination).toEqual({ pageIndex: 0, pageSize: 50 })
  })

  it('passes the result through normalize (actions forced last + right-pinned)', () => {
    const state = hydrateView({
      columnOrder: ['actions', 'owner', 'account'],
      columnPinning: { left: ['actions'], right: [] },
    })
    expect(state.columnOrder[state.columnOrder.length - 1]).toBe('actions')
    expect(state.columnPinning).toEqual({ left: [], right: ['actions'] })
  })

  it('empty payload equals DEFAULT_STATE', () => {
    expect(hydrateView({})).toEqual(DEFAULT_STATE)
  })
})

describe('migrateLegacy (non-destructive, builds a v1 view from legacy keys)', () => {
  it('remaps ledger.cols {name->account} merged over default visibility', () => {
    localStorage.setItem('ledger.cols', JSON.stringify({ name: false, arr: true }))
    const view = migrateLegacy()
    expect(view.columnVisibility).toEqual({ account: false, arr: true, since: false })
  })

  it('passes ledger.colOrder through normalize', () => {
    localStorage.setItem('ledger.colOrder', JSON.stringify(['actions', 'owner', 'account']))
    const view = migrateLegacy()
    expect(view.columnOrder).toEqual(['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'])
  })

  it('seeds all other fields with defaults', () => {
    const view = migrateLegacy()
    expect(view.version).toBe(GRID_VIEW_VERSION)
    expect(view.columnSizing).toEqual({})
    expect(view.columnPinning).toEqual({ left: [], right: ['actions'] })
    expect(view.columnFilters).toEqual([])
    expect(view.sorting).toEqual([{ id: 'mrr', desc: true }])
    expect(view.density).toBe('compact')
    expect(view.pagination).toEqual({ pageSize: 25 })
    expect(view.numberFormats).toEqual({})
  })

  it('with no legacy keys, returns a defaults-only v1 view', () => {
    const view = migrateLegacy()
    expect(view.columnVisibility).toEqual({ account: true, arr: false, since: false })
    expect(view.columnOrder).toEqual(['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'])
  })

  it('leaves legacy keys intact (non-destructive)', () => {
    localStorage.setItem('ledger.cols', JSON.stringify({ arr: true }))
    localStorage.setItem('ledger.colOrder', JSON.stringify(['owner', 'account']))
    migrateLegacy()
    expect(localStorage.getItem('ledger.cols')).toBe(JSON.stringify({ arr: true }))
    expect(localStorage.getItem('ledger.colOrder')).toBe(JSON.stringify(['owner', 'account']))
  })
})
