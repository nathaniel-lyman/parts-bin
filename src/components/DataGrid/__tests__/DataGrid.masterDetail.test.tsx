import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import type { DataGridColumn } from '../types'

interface Row {
  id: string
  name: string
  owner: string
}

const columns: DataGridColumn<Row>[] = [
  { id: 'account', accessorKey: 'name', header: 'Account', type: 'text' },
  { id: 'owner', accessorKey: 'owner', header: 'Owner', type: 'text' },
]

const rows: Row[] = [
  { id: 'r1', name: 'Alpha account', owner: 'Dana' },
]

describe('DataGrid master-detail rows', () => {
  it('renders an expanded detail row below the source row', () => {
    render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getRowCanExpand={() => true}
        renderDetailPanel={({ row }) => <div>Details for {row.name}</div>}
        enablePagination={false}
      />,
    )

    expect(screen.queryByText('Details for Alpha account')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Expand Alpha account' }))
    expect(screen.getByTestId('grid-row-r1-detail')).toHaveAttribute('data-row-detail', 'true')
    expect(screen.getByText('Details for Alpha account')).toBeInTheDocument()
  })

  it('expands and collapses detail rows from the keyboard on the tree column', () => {
    const { container } = render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getRowCanExpand={() => true}
        renderDetailPanel={({ row }) => <div>Details for {row.name}</div>}
        enablePagination={false}
      />,
    )
    const cell = container.querySelector<HTMLElement>('td[data-row-index="0"][data-col-index="0"]')
    if (!cell) throw new Error('tree cell not found')

    fireEvent.focus(cell)
    cell.focus()
    fireEvent.keyDown(cell, { key: 'ArrowRight' })
    expect(screen.getByText('Details for Alpha account')).toBeInTheDocument()

    fireEvent.keyDown(cell, { key: 'ArrowLeft' })
    expect(screen.queryByText('Details for Alpha account')).not.toBeInTheDocument()
  })
})
