import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const noop = vi.fn()
const cols = () => accountGridColumns({ onEdit: noop, onDelete: noop })

describe('DataGridToolbar quick filter', () => {
  it('filters by account name and owner', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.type(screen.getByPlaceholderText(/search accounts or owners/i), 'rivera')

    expect(screen.getByText('Foxglove Labs')).toBeInTheDocument()
    expect(screen.getByText('Quill Analytics')).toBeInTheDocument()
    expect(screen.queryByText('Cobalt Freight')).toBeNull()
  })
})
