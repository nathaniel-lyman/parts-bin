import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Account } from '../data/types'
import { accountGlobalFilter, buildAccountGridColumns } from './accountGridColumns'

const acme: Account = {
  id: '1',
  name: 'Acme',
  owner: 'Dana',
  segment: 'Enterprise',
  mrr: 1200,
  growth: -3.5,
  status: 'At risk',
  arr: 14400,
  since: '2023-01-01',
}

describe('buildAccountGridColumns', () => {
  it('defines the 9 parity columns in order with account id mapped from name', () => {
    const cols = buildAccountGridColumns(vi.fn(), vi.fn())
    expect(cols.map((column) => column.id)).toEqual([
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
    const account = cols.find((column) => column.id === 'account')!
    expect(account.accessorKey).toBe('name')
    expect(account.header).toBe('Account')
  })

  it('right-aligns currency/percent columns', () => {
    const cols = buildAccountGridColumns(vi.fn(), vi.fn())
    for (const id of ['mrr', 'growth', 'arr']) {
      expect(cols.find((column) => column.id === id)!.align).toBe('right')
      expect(cols.find((column) => column.id === id)!.meta?.align).toBe('right')
    }
  })

  it('maps text columns and resize affordances into column meta', () => {
    const cols = buildAccountGridColumns(vi.fn(), vi.fn())
    const byId = (id: string) => cols.find((column) => column.id === id)!
    expect(byId('account').meta?.align).toBe('left')
    expect(byId('owner').meta?.align).toBe('left')
    expect(byId('account').meta?.resizable).toBe(true)
    expect(byId('actions').meta?.resizable).toBe(false)
  })

  it('locks the actions column', () => {
    const actions = buildAccountGridColumns(vi.fn(), vi.fn()).find((column) => column.id === 'actions')!
    expect(actions.header).toBe('Actions')
    expect(actions.width).toBe(76)
    expect(actions.minWidth).toBe(76)
    expect(actions.maxWidth).toBe(76)
    expect(actions.hideable).toBe(false)
    expect(actions.sortable).toBe(false)
    expect(actions.reorderable).toBe(false)
    expect(actions.exportable).toBe(false)
    expect(actions.type).toBe('actions')
  })

  it('growth cell uses text-neg when negative', () => {
    const growth = buildAccountGridColumns(vi.fn(), vi.fn()).find((column) => column.id === 'growth')!
    const { container } = render(<>{growth.cell!({ value: acme.growth, row: acme, rowId: acme.id })}</>)
    expect(container.querySelector('.text-neg')).not.toBeNull()
  })

  it('actions cell wires aria-labels and onEdit/onDelete', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const actions = buildAccountGridColumns(onEdit, onDelete).find((column) => column.id === 'actions')!
    render(<>{actions.cell!({ value: undefined, row: acme, rowId: acme.id })}</>)
    screen.getByLabelText('Edit Acme').click()
    screen.getByLabelText('Delete Acme').click()
    expect(onEdit).toHaveBeenCalledWith(acme)
    expect(onDelete).toHaveBeenCalledWith(acme)
  })

  it('actions cell buttons are type=button and reveal on keyboard focus', () => {
    const actions = buildAccountGridColumns(vi.fn(), vi.fn()).find((column) => column.id === 'actions')!
    const { container } = render(<>{actions.cell!({ value: undefined, row: acme, rowId: acme.id })}</>)
    const edit = screen.getByLabelText('Edit Acme')
    const del = screen.getByLabelText('Delete Acme')
    // default <button> type is "submit" — would submit an ancestor form before onClick
    expect(edit).toHaveAttribute('type', 'button')
    expect(del).toHaveAttribute('type', 'button')
    // hover-only reveal hides the actions from keyboard users
    expect(container.querySelector('.group-focus-within\\:opacity-100')).not.toBeNull()
  })

  it('status cell renders the StatusBadge', () => {
    const status = buildAccountGridColumns(vi.fn(), vi.fn()).find((column) => column.id === 'status')!
    render(<>{status.cell!({ value: acme.status, row: acme, rowId: acme.id })}</>)
    expect(screen.getByText('At risk')).toBeInTheDocument()
  })

  it('accountGlobalFilter matches name OR owner, case-insensitive', () => {
    expect(accountGlobalFilter(acme, 'acm')).toBe(true)
    expect(accountGlobalFilter(acme, 'DANA')).toBe(true)
    expect(accountGlobalFilter(acme, 'zzz')).toBe(false)
  })
})
