import { describe, expect, it } from 'vitest'
import {
  ACTIONS_COLUMN_ID,
  MOVABLE_COLUMN_IDS,
  canExportColumn,
  canHideColumn,
  canReorderColumn,
  canSortColumn,
  isMovableColumnId,
  lockedColumnIds,
  normalizeColumnOrder,
  normalizeColumnPinning,
  normalizeGrouping,
  normalizeSorting,
  normalizeState,
} from '../normalize'
import type { DataGridState } from '../types'

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

const base: DataGridState = {
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

describe('lockPosition capability (generic, non-actions column)', () => {
  const lockedIds = new Set(['rowMenu'])
  const columnIds = ['name', 'score', 'rowMenu']

  it('lockedColumnIds picks up lockPosition, type:actions, and the legacy id', () => {
    expect(
      lockedColumnIds([
        { id: 'a' },
        { id: 'b', lockPosition: 'last' },
        { id: 'c', type: 'actions' },
        { id: 'actions' },
      ]),
    ).toEqual(['b', 'c', 'actions'])
  })

  it('forces a lockPosition column last in order even if it leads the input', () => {
    expect(normalizeColumnOrder(['rowMenu', 'score', 'name'], columnIds, lockedIds)).toEqual([
      'score',
      'name',
      'rowMenu',
    ])
  })

  it('pins a lockPosition column right and never left', () => {
    expect(normalizeColumnPinning({ left: ['rowMenu'], right: [] }, columnIds, lockedIds)).toEqual({
      left: [],
      right: ['rowMenu'],
    })
  })

  it('excludes a lockPosition column from sorting and grouping', () => {
    expect(normalizeSorting([{ id: 'rowMenu', desc: false }, { id: 'name', desc: true }], lockedIds)).toEqual([
      { id: 'name', desc: true },
    ])
    expect(normalizeGrouping(['rowMenu', 'name'], columnIds, lockedIds)).toEqual(['name'])
  })

  it('forces a hidden lockPosition column back to visible', () => {
    const out = normalizeState(
      {
        ...base,
        columnOrder: columnIds,
        columnVisibility: { rowMenu: false },
        columnPinning: { left: [], right: [] },
      },
      columnIds,
      lockedIds,
    )
    expect(out.columnVisibility.rowMenu).toBe(true)
    expect(out.columnOrder[out.columnOrder.length - 1]).toBe('rowMenu')
    expect(out.columnPinning.right).toEqual(['rowMenu'])
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
