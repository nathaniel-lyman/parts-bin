import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import type { DataGridColumn } from '../types'

interface TreeRow {
  id: string
  name: string
  owner: string
  children?: TreeRow[]
}

const columns: DataGridColumn<TreeRow>[] = [
  { id: 'account', accessorKey: 'name', header: 'Account', type: 'text' },
  { id: 'owner', accessorKey: 'owner', header: 'Owner', type: 'text' },
]

const rows: TreeRow[] = [
  {
    id: 'p1',
    name: 'Parent account',
    owner: 'Dana',
    children: [
      { id: 'c1', name: 'Child account', owner: 'Lee' },
    ],
  },
]

describe('DataGrid tree data', () => {
  it('expands nested rows independently of grouping', async () => {
    const { container } = render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getSubRows={(row) => row.children}
        enablePagination={false}
      />,
    )

    expect(screen.getByText('Parent account')).toBeInTheDocument()
    expect(screen.queryByText('Child account')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Expand Parent account' }))

    expect(screen.getByText('Child account')).toBeInTheDocument()
    const childRow = container.querySelector<HTMLElement>('tr[data-row-id="c1"]')
    expect(childRow).toHaveAttribute('data-row-depth', '1')
    expect(childRow).toHaveAttribute('aria-level', '2')
  })
})
