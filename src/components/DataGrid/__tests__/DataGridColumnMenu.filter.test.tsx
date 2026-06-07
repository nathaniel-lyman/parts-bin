import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const noop = vi.fn()
const cols = () => accountGridColumns({ onEdit: noop, onDelete: noop })

describe('column-menu per-column filter', () => {
  it('the segment column carries enum filter meta decoupled from its public type', () => {
    const segment = cols().find((column) => column.id === 'segment')!
    expect(segment.type).toBe('status')
    expect(segment.meta?.type).toBe('enum')
    expect(segment.meta?.options).toEqual(['Enterprise', 'Mid-market', 'Startup'])
  })

  it('filters enum columns through the menu', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('button', { name: /segment column menu/i }))
    const menu = screen.getByRole('menu', { name: /segment column menu/i })
    await user.click(within(menu).getByRole('checkbox', { name: 'Startup' }))

    expect(screen.getByText('Foxglove Labs')).toBeInTheDocument()
    expect(screen.getByText('Quill Analytics')).toBeInTheDocument()
    expect(screen.queryByText('Cobalt Freight')).toBeNull()
  })

  it('filters numeric columns through the menu', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={seedAccounts} columns={cols()} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('button', { name: /mrr column menu/i }))
    await user.selectOptions(screen.getByLabelText(/mrr filter operator/i), 'greaterThan')
    await user.type(screen.getByLabelText(/mrr filter value/i), '20000')

    expect(screen.getByText('Cobalt Freight')).toBeInTheDocument()
    expect(screen.queryByText('Meridian Corp')).toBeNull()
  })
})
