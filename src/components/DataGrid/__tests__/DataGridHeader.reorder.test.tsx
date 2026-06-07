import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { buildAccountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const columns = buildAccountGridColumns(vi.fn(), vi.fn())

describe('DataGridHeader reorder handles', () => {
  it('renders a Move handle for each visible movable column', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.getByRole('button', { name: 'Move Account column' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move Owner column' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move MRR column' })).toBeInTheDocument()
  })

  it('does not render a Move handle for the locked actions column', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)
    const handles = screen.getAllByRole('button', { name: /^Move .+ column$/ })
    expect(handles).toHaveLength(6)
  })

  it('renders a resize separator for each resizable visible column', () => {
    render(<DataGrid rows={seedAccounts} columns={columns} getRowId={(row) => row.id} />)
    expect(screen.getByRole('separator', { name: 'Resize Account column' })).toBeInTheDocument()
  })
})

