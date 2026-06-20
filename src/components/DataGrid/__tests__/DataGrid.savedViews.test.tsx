import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { ACCOUNT_GRID_INITIAL_STATE, accountGridColumns } from '../../accountGridColumns'
import { savedViewsKeyForGrid } from '../../../hooks/useSavedViews'
import { DataGrid } from '../DataGrid'

function renderGrid() {
  render(
    <DataGrid
      rows={seedAccounts}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      persistenceKey="ledger.accounts.grid"
      initialState={ACCOUNT_GRID_INITIAL_STATE}
    />,
  )
}

const ownerVisible = () => screen.queryByRole('columnheader', { name: /owner/i }) != null

describe('DataGrid saved views', () => {
  it('saves a mutated layout, resets, and reapplies it', async () => {
    renderGrid()
    // Owner is visible by default; hide it to create a non-default layout.
    expect(ownerVisible()).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /columns/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^owner$/i }))
    await userEvent.keyboard('{Escape}')
    expect(ownerVisible()).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.type(screen.getByPlaceholderText(/view name/i), 'Snapshot')
    await userEvent.click(screen.getByRole('button', { name: /save current/i }))

    const stored = JSON.parse(localStorage.getItem(savedViewsKeyForGrid('ledger.accounts.grid'))!)
    expect(stored[0].name).toBe('Snapshot')
    expect(stored[0].view.columnVisibility.owner).toBe(false)

    // Reset restores the grid's built-in defaults (all columns visible).
    await userEvent.click(screen.getByRole('button', { name: /columns/i }))
    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(ownerVisible()).toBe(true)

    // Reapplying the saved view restores the hidden column.
    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.click(screen.getByRole('button', { name: /apply snapshot/i }))
    expect(ownerVisible()).toBe(false)
  })
})
