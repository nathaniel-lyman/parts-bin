import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows = Array.from({ length: 30 }, (_, index) => ({
  ...seedAccounts[index % seedAccounts.length],
  id: `r${index}`,
  name: `Acct ${index}`,
}))

function bodyRows() {
  // Data rows only — skips the header row and the aggregation footer row.
  return screen.getAllByRole('row').filter((row) => row.hasAttribute('data-row-id'))
}

describe('DataGrid pagination', () => {
  it('paginates local rows and advances pages', async () => {
    render(
      <DataGrid
        rows={rows}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        initialState={{ sorting: [], pagination: { pageIndex: 0, pageSize: 10 } }}
      />,
    )

    expect(bodyRows()).toHaveLength(10)
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(within(bodyRows()[0]).getByText('Acct 0')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /next page/i }))

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(10)
    expect(within(bodyRows()[0]).getByText('Acct 10')).toBeInTheDocument()
  })
})
