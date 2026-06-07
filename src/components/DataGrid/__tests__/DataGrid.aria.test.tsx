import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

function renderGrid() {
  render(
    <DataGrid
      rows={seedAccounts}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      enableRowSelection
    />,
  )
}

describe('DataGrid ARIA', () => {
  it('exposes a grid with row and column counts', () => {
    renderGrid()
    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount')
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount')
  })

  it('updates row selection and menu expanded state', async () => {
    renderGrid()
    const row = screen.getByRole('row', { name: /Cobalt Freight/ })
    expect(row).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(screen.getByRole('checkbox', { name: /Select Cobalt Freight/ }))
    expect(row).toHaveAttribute('aria-selected', 'true')

    const trigger = screen.getByRole('button', { name: /MRR column menu/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
