import { describe, expect, it } from 'vitest'
import { DENSITIES } from '../types'
import type {
  Density,
  DataGridCellContext,
  DataGridColumn,
  DataGridState,
  GridAction,
  GridRuntimeStatus,
} from '../types'
import type { Account } from '../../../data/types'

const BASE_STATE: DataGridState = {
  sorting: [{ id: 'mrr', desc: true }],
  columnFilters: [],
  globalFilter: '',
  columnVisibility: { account: true },
  columnOrder: ['account', 'actions'],
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

describe('grid types', () => {
  it('DENSITIES is the canonical ordered runtime list', () => {
    expect(DENSITIES).toEqual(['compact', 'standard', 'comfortable'])
  })

  it('Density is assignable from each DENSITIES member', () => {
    const density: Density = DENSITIES[0]
    expect(density).toBe('compact')
  })

  it('DataGridColumn<Account> accepts a parity column shape (compile check)', () => {
    const column: DataGridColumn<Account, number> = {
      id: 'mrr',
      accessorKey: 'mrr',
      header: 'MRR',
      align: 'right',
      type: 'currency',
      numberFormat: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
      cell: (ctx: DataGridCellContext<Account, number>) => ctx.formattedValue || String(ctx.value),
    }
    expect(column.id).toBe('mrr')
  })

  it('DataGridState holds Community+Pro slices only (compile check)', () => {
    expect(BASE_STATE.density).toBe('compact')
  })

  it('GridAction discriminated union covers the Phase 1 slices (compile check)', () => {
    const actions: GridAction[] = [
      { type: 'SET_SORTING', sorting: [{ id: 'mrr', desc: true }] },
      { type: 'SET_GLOBAL_FILTER', value: 'acme' },
      { type: 'SET_COLUMN_VISIBILITY', columnVisibility: { arr: true } },
      { type: 'SET_COLUMN_ORDER', columnOrder: ['owner', 'account', 'actions'] },
    ]
    expect(actions).toHaveLength(4)
  })

  it('GridRuntimeStatus models idle/loading/error (compile check)', () => {
    const status: GridRuntimeStatus = { status: 'error', error: new Error('boom') }
    expect(status.status).toBe('error')
  })
})
