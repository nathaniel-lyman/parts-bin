import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Account } from '../../../data/types'
import { accountGlobalFilter, accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Dana', segment: 'Enterprise', mrr: 900, growth: 5, status: 'Active', arr: 10800, since: '2021-01-01' },
  { id: 'a2', name: 'Beta', owner: 'Lee', segment: 'Startup', mrr: 300, growth: -2, status: 'At risk', arr: 3600, since: '2022-02-02' },
  { id: 'a3', name: 'Cobalt', owner: 'Ravi', segment: 'Mid-market', mrr: 600, growth: 1, status: 'Active', arr: 7200, since: '2023-03-03' },
]

function renderGrid() {
  return render(
    <DataGrid<Account>
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      globalFilterFn={accountGlobalFilter}
      enableRowSelection
    />,
  )
}

describe('DataGrid row selection', () => {
  it('per-row checkbox selects a row and surfaces the bulk-action count', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Acme' }))
    expect(screen.getByRole('checkbox', { name: 'Select Acme' })).toBeChecked()
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })

  it('header select-all checks every visible row, and clear empties the count', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: /^select all$/i }))
    expect(screen.getByRole('checkbox', { name: 'Select Acme' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Select Beta' })).toBeChecked()
    expect(screen.getByText('3 selected')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /clear selection/i }))
    expect(screen.queryByText(/selected/)).toBeNull()
    expect(screen.getByRole('checkbox', { name: 'Select Acme' })).not.toBeChecked()
  })

  it('row click and Space toggle selection without double-toggling the checkbox', async () => {
    renderGrid()
    const betaRow = screen.getByRole('checkbox', { name: 'Select Beta' }).closest('tr')!
    await userEvent.click(within(betaRow).getByText('Beta'))
    expect(screen.getByRole('checkbox', { name: 'Select Beta' })).toBeChecked()

    betaRow.focus()
    await userEvent.keyboard(' ')
    expect(screen.getByRole('checkbox', { name: 'Select Beta' })).not.toBeChecked()
  })

  it('select-all only covers visible filtered rows', async () => {
    renderGrid()
    await userEvent.type(screen.getByRole('searchbox', { name: /quick filter/i }), 'Acme')
    await userEvent.click(screen.getByRole('checkbox', { name: /^select all$/i }))
    expect(screen.getByRole('checkbox', { name: 'Select Acme' })).toBeChecked()
    expect(screen.queryByText('Beta')).toBeNull()
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })
})
