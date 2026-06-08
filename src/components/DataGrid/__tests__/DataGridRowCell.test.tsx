import { render, screen } from '@testing-library/react'
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { DataGridRow } from '../DataGridRow'

interface Item { id: string; name: string; mrr: number }
const data: Item[] = [{ id: '1', name: 'Acme', mrr: 9 }]
const columns: ColumnDef<Item>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'mrr', accessorKey: 'mrr', header: 'MRR', meta: { align: 'right' } },
]

function Harness() {
  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getRowId: (row) => row.id, getCoreRowModel: getCoreRowModel() })
  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <DataGridRow key={row.id} row={row} />
        ))}
      </tbody>
    </table>
  )
}

function PreviewHarness() {
  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getRowId: (row) => row.id, getCoreRowModel: getCoreRowModel() })
  return (
    <table>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <DataGridRow
            key={row.id}
            row={row}
            dragPreview={{
              activeId: 'name',
              overId: 'mrr',
              projectedOrder: ['mrr', 'name'],
              offsets: { mrr: -140 },
            }}
          />
        ))}
      </tbody>
    </table>
  )
}

describe('DataGridRow / DataGridCell', () => {
  it('renders a row with class "group" and cells with their values', () => {
    render(<Harness />)
    const row = screen.getByText('Acme').closest('tr')!
    expect(row.className).toContain('group')
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('right-aligns a cell whose column meta.align is right', () => {
    render(<Harness />)
    const cell = screen.getByText('9').closest('td')!
    expect(cell.className).toContain('text-right')
  })

  it('dims the active drag-preview column and translates displaced cells', () => {
    render(<PreviewHarness />)
    const activeCell = screen.getByText('Acme').closest('td')!
    const shiftedCell = screen.getByText('9').closest('td')!

    expect(activeCell).toHaveAttribute('data-column-id', 'name')
    expect(activeCell.style.opacity).toBe('0.28')
    expect(shiftedCell).toHaveAttribute('data-column-id', 'mrr')
    expect(shiftedCell.style.transform).toBe('translateX(-140px)')
  })
})
