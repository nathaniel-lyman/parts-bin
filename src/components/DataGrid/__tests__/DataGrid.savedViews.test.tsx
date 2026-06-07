import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { SAVED_VIEWS_KEY } from '../../../hooks/useSavedViews'
import { DataGrid } from '../DataGrid'

function renderGrid() {
  render(
    <DataGrid
      rows={seedAccounts}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      persistenceKey="ledger.accounts.grid"
    />,
  )
}

const arrVisible = () => screen.queryByRole('columnheader', { name: /arr/i }) != null

describe('DataGrid saved views', () => {
  it('saves a mutated layout, resets, and reapplies it', async () => {
    renderGrid()
    expect(arrVisible()).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: /columns/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^arr$/i }))
    await userEvent.keyboard('{Escape}')
    expect(arrVisible()).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.type(screen.getByPlaceholderText(/view name/i), 'Snapshot')
    await userEvent.click(screen.getByRole('button', { name: /save current/i }))

    const stored = JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY)!)
    expect(stored[0].name).toBe('Snapshot')
    expect(stored[0].view.columnVisibility.arr).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(arrVisible()).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.click(screen.getByRole('button', { name: /apply snapshot/i }))
    expect(arrVisible()).toBe(true)
  })
})
