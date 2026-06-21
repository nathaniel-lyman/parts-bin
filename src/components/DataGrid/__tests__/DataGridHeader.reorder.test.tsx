import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { buildAccountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const columns = buildAccountGridColumns(vi.fn(), vi.fn())

describe('DataGridHeader reorder handles', () => {
  it('keeps column headers as the drag affordance without visible move handles', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.queryByRole('button', { name: /^Move .+ column$/ })).toBeNull()
    expect(screen.getByRole('columnheader', { name: /Account/ })).toHaveClass('cursor-pointer')
  })

  it('renders a resize separator for each resizable visible column', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.getByRole('separator', { name: 'Resize Account column' })).toBeInTheDocument()
  })

  it('draws vertical separators between header cells', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.getByRole('columnheader', { name: /Owner/ })).toHaveClass('border-r', 'border-line')
  })

  it('shows persistent menu and filter icons with controls left and right-aligned labels', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)

    expect(screen.getByRole('button', { name: /account column menu/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /account column filter/i })).toBeVisible()
    expect(screen.getByTestId('col-header-controls-mrr')).toHaveClass('justify-self-start')
    expect(screen.getByTestId('col-header-label-mrr')).toHaveClass('justify-self-end', 'text-right')
  })

  it('marks header and body cells with column ids for drag-preview measurement', () => {
    const { container } = render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)

    expect(screen.getByRole('columnheader', { name: /Account/ })).toHaveAttribute('data-column-id', 'account')
    expect(container.querySelector('td[data-column-id="account"]')).toBeInTheDocument()
  })
})
