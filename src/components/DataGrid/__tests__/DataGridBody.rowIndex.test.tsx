import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const noop = vi.fn()

describe('DataGrid row indexing', () => {
  it('assigns sequential data-row-index values to center rows', () => {
    const { container } = render(
      <DataGrid rows={seedAccounts} columns={accountGridColumns({ onEdit: noop, onDelete: noop })} getRowId={(row) => row.id} />,
    )
    const firstColumnCells = Array.from(container.querySelectorAll<HTMLElement>('td[data-col-index="0"]'))
    const indices = firstColumnCells.map((cell) => cell.getAttribute('data-row-index'))
    expect(indices.slice(0, 5)).toEqual(['0', '1', '2', '3', '4'])
  })
})
