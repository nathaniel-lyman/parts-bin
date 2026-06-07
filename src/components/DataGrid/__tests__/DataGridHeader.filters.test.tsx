import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const noop = vi.fn()
const cols = () => accountGridColumns({ onEdit: noop, onDelete: noop })

describe('inline header filters', () => {
  it('renders header filter controls only when enabled', () => {
    const { rerender } = render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)
    expect(screen.queryByRole('textbox', { name: /filter account/i })).toBeNull()

    rerender(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} enableHeaderFilters />)
    expect(screen.getByRole('textbox', { name: /filter account/i })).toBeInTheDocument()
  })

  it('filters through the same column-filter slice', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} enableHeaderFilters />)

    await user.type(screen.getByRole('textbox', { name: /filter account/i }), 'cobalt')

    expect(screen.getByText('Cobalt Freight')).toBeInTheDocument()
    expect(screen.queryByText('Meridian Corp')).toBeNull()
  })
})
