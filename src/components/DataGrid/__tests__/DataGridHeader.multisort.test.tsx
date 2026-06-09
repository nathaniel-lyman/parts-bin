import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const noop = vi.fn()
const cols = () => accountGridColumns({ onEdit: noop, onDelete: noop })

describe('multi-sort header interaction', () => {
  it('plain click sets aria-sort ascending on that header', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('columnheader', { name: /segment/i }))

    expect(screen.getByRole('columnheader', { name: /segment/i })).toHaveAttribute('aria-sort', 'ascending')
  })

  it('shift-click keeps the primary sort and appends a secondary sort', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('columnheader', { name: /segment/i }))
    fireEvent.click(screen.getByRole('columnheader', { name: /mrr/i }), { shiftKey: true })

    expect(screen.getByRole('columnheader', { name: /segment/i })).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('columnheader', { name: /mrr/i })).toHaveAttribute('aria-sort', 'ascending')
  })

  it('shows 1-based sort priority badges when multiple columns are sorted', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('columnheader', { name: /segment/i }))
    fireEvent.click(screen.getByRole('columnheader', { name: /mrr/i }), { shiftKey: true })

    expect(within(screen.getByRole('columnheader', { name: /segment/i })).getByTestId('sort-priority')).toHaveTextContent('1')
    expect(within(screen.getByRole('columnheader', { name: /mrr/i })).getByTestId('sort-priority')).toHaveTextContent('2')
  })

  it('shows no priority badge when only one column is sorted', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('columnheader', { name: /segment/i }))

    expect(within(screen.getByRole('columnheader', { name: /segment/i })).queryByTestId('sort-priority')).toBeNull()
  })
})
