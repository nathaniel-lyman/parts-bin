import { describe, expect, it } from 'vitest'
import {
  ACTIONS_COLUMN_ID,
  DEFAULT_COLUMN_ORDER,
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
    expect(normalizeColumnOrder(['actions', 'owner', 'ghost', 'owner', 'account'])).toEqual([
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

  it('non-array input returns the default order', () => {
    expect(normalizeColumnOrder(undefined)).toEqual([...DEFAULT_COLUMN_ORDER])
    expect(normalizeColumnOrder(null)).toEqual([...DEFAULT_COLUMN_ORDER])
    expect(normalizeColumnOrder('account')).toEqual([...DEFAULT_COLUMN_ORDER])
  })

  it('empty array yields canonical default order', () => {
    expect(normalizeColumnOrder([])).toEqual([...DEFAULT_COLUMN_ORDER])
  })

  it('isMovableColumnId excludes actions, includes the movable ids', () => {
    expect(isMovableColumnId('actions')).toBe(false)
    expect(isMovableColumnId('account')).toBe(true)
    expect(isMovableColumnId('unknown')).toBe(false)
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
}

describe('normalizeColumnPinning (actions always right, never left/absent)', () => {
  it('keeps actions pinned right when already correct', () => {
    expect(normalizeColumnPinning({ left: [], right: ['actions'] })).toEqual({ left: [], right: ['actions'] })
  })

  it('adds actions to right when absent', () => {
    expect(normalizeColumnPinning({ left: [], right: [] })).toEqual({ left: [], right: ['actions'] })
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
    })
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
})

