import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Account } from '../../../data/types'
import { accountGlobalFilter, accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Dana', segment: 'Enterprise', mrr: 900, growth: 5, status: 'Active', arr: 10800, since: '2021-01-01' },
]

describe('DataGrid actions column', () => {
  it('fires edit/delete handlers and does not toggle selection', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <DataGrid<Account>
        rows={rows}
        columns={accountGridColumns({ onEdit, onDelete })}
        getRowId={(row) => row.id}
        globalFilterFn={accountGlobalFilter}
        enableRowSelection
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Edit Acme' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete Acme' }))

    expect(onEdit).toHaveBeenCalledWith(rows[0])
    expect(onDelete).toHaveBeenCalledWith(rows[0])
    expect(screen.getByRole('checkbox', { name: 'Select Acme' })).not.toBeChecked()
    expect(screen.queryByText(/selected/)).toBeNull()
  })
})
