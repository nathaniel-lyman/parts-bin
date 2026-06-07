import { describe, expect, it } from 'vitest'
import { DENSITIES } from '../types'
import type {
  Density,
  GridAction,
  GridRuntimeStatus,
  LedgerCellContext,
  LedgerGridColumn,
  LedgerGridState,
} from '../types'
import type { Account } from '../../../data/types'

describe('grid types', () => {
  it('DENSITIES is the canonical ordered runtime list', () => {
    expect(DENSITIES).toEqual(['compact', 'standard', 'comfortable'])
  })

  it('Density is assignable from each DENSITIES member', () => {
    const density: Density = DENSITIES[0]
    expect(density).toBe('compact')
  })

  it('LedgerGridColumn<Account> accepts a parity column shape (compile check)', () => {
    const column: LedgerGridColumn<Account, number> = {
      id: 'mrr',
      accessorKey: 'mrr',
      header: 'MRR',
      align: 'right',
      type: 'currency',
      cell: (ctx: LedgerCellContext<Account, number>) => String(ctx.value),
    }
    expect(column.id).toBe('mrr')
  })

  it('LedgerGridState holds Community+Pro slices only (compile check)', () => {
    const state: LedgerGridState = {
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
    }
    expect(state.density).toBe('compact')
  })

  it('GridAction discriminated union covers the Phase 1 slices (compile check)', () => {
    const actions: GridAction[] = [
      { type: 'setSorting', sorting: [{ id: 'mrr', desc: true }] },
      { type: 'setGlobalFilter', globalFilter: 'acme' },
      { type: 'setColumnVisibility', columnVisibility: { arr: true } },
      { type: 'setColumnOrder', columnOrder: ['owner', 'account', 'actions'] },
    ]
    expect(actions).toHaveLength(4)
  })

  it('GridRuntimeStatus models idle/loading/error (compile check)', () => {
    const status: GridRuntimeStatus = { status: 'error', error: new Error('boom') }
    expect(status.status).toBe('error')
  })
})
