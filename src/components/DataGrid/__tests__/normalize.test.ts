import { describe, expect, it } from 'vitest'
import {
  ACTIONS_COLUMN_ID,
  MOVABLE_COLUMN_IDS,
  canExportColumn,
  canHideColumn,
  canReorderColumn,
  canSortColumn,
  isMovableColumnId,
  normalizeColumnOrder,
  normalizeColumnPinning,
  normalizeState,
} from '../normalize'
import type { LedgerGridState } from '../types'

describe('normalizeColumnOrder (ported verbatim)', () => {
  it('golden case: dedupes, drops unknowns, appends missing, forces actions last', () => {
    expect(normalizeColumnOrder(['actions', 'owner', 'ghost', 'owner', 'account'], accountOrder)).toEqual([
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

  it('non-array input returns the provided column order without demo account columns', () => {
    expect(normalizeColumnOrder(undefined)).toEqual([])
    expect(normalizeColumnOrder(null)).toEqual([])
    expect(normalizeColumnOrder('account')).toEqual([])
    expect(normalizeColumnOrder(undefined, ['name', 'score', 'actions'])).toEqual(['name', 'score', 'actions'])
  })

  it('empty array yields the current columns when provided', () => {
    expect(normalizeColumnOrder([])).toEqual([])
    expect(normalizeColumnOrder([], ['name', 'score'])).toEqual(['name', 'score'])
  })

  it('isMovableColumnId excludes actions and allows arbitrary clone columns', () => {
    expect(isMovableColumnId('actions')).toBe(false)
    expect(isMovableColumnId('account')).toBe(true)
    expect(isMovableColumnId('custom-domain-column')).toBe(true)
    expect(MOVABLE_COLUMN_IDS).not.toContain(ACTIONS_COLUMN_ID)
  })
})

const base: LedgerGridState = {
  sorting: [{ id: 'mrr', desc: true }],
  columnFilters: [],
  globalFilter: '',
  columnVisibility: { account: true, arr: false, since: false },
  columnOrder: ['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'],
  columnSizing: {},
  columnPinning: { left: [], right: ['actions'] },
  rowSelection: {},
  rowPinning: { top: [], bottom: [] },
  pagination: { pageIndex: 0, pageSize: 25 },
  density: 'compact',
  grouping: [],
  expanded: {},
  numberFormats: {},
}
const accountOrder = ['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']

describe('normalizeColumnPinning (actions locked right when present)', () => {
  it('keeps actions pinned right when already correct', () => {
    expect(normalizeColumnPinning({ left: [], right: ['actions'] })).toEqual({ left: [], right: ['actions'] })
  })

  it('does not inject actions into generic grids that do not have an actions column', () => {
    expect(normalizeColumnPinning({ left: [], right: [] })).toEqual({ left: [], right: [] })
  })

  it('adds actions to right when the current columns include actions', () => {
    expect(normalizeColumnPinning({ left: [], right: [] }, accountOrder)).toEqual({ left: [], right: ['actions'] })
  })

  it('removes actions from left and forces it into right', () => {
    expect(normalizeColumnPinning({ left: ['actions'], right: [] })).toEqual({ left: [], right: ['actions'] })
  })

  it('dedupes actions in right', () => {
    expect(normalizeColumnPinning({ left: [], right: ['actions', 'actions'] })).toEqual({
      left: [],
      right: ['actions'],
    })
  })
})

describe('actions-lock predicate helpers', () => {
  it('actions is non-hideable, non-sortable, non-reorderable, non-exportable', () => {
    expect(canHideColumn('actions')).toBe(false)
    expect(canSortColumn('actions')).toBe(false)
    expect(canReorderColumn('actions')).toBe(false)
    expect(canExportColumn('actions')).toBe(false)
  })

  it('movable columns are hideable/sortable/reorderable/exportable', () => {
    expect(canHideColumn('mrr')).toBe(true)
    expect(canSortColumn('mrr')).toBe(true)
    expect(canReorderColumn('mrr')).toBe(true)
    expect(canExportColumn('mrr')).toBe(true)
  })
})

describe('normalizeState composes order + pinning', () => {
  it('coerces a violating order/pinning back to a valid shape', () => {
    const out = normalizeState({
      ...base,
      columnOrder: ['actions', 'owner', 'ghost', 'account'],
      columnPinning: { left: ['actions'], right: [] },
    }, accountOrder)
    expect(out.columnOrder).toEqual(['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions'])
    expect(out.columnPinning).toEqual({ left: [], right: ['actions'] })
  })

  it('forces actions visible even if visibility tries to hide it', () => {
    const out = normalizeState({ ...base, columnVisibility: { ...base.columnVisibility, actions: false } })
    expect(out.columnVisibility.actions).toBe(true)
  })

  it('is a no-op on already-normalized state', () => {
    expect(normalizeState(base)).toEqual(base)
  })

  it('drops number format overrides for unknown columns when current columns are provided', () => {
    const out = normalizeState({
      ...base,
      numberFormats: {
        mrr: { style: 'currency', currency: 'EUR' },
        ghost: { style: 'number' },
      },
    }, accountOrder)
    expect(out.numberFormats).toEqual({ mrr: { style: 'currency', currency: 'EUR' } })
  })
})
