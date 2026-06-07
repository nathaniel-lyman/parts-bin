import { fireEvent, render, screen } from '@testing-library/react'
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { describe, expect, it, vi } from 'vitest'
import { DataGridBody } from '../DataGridBody'

interface Row { id: string; name: string }

const data: Row[] = [{ id: 'a1', name: 'Acme' }]
const columns: ColumnDef<Row>[] = [{ id: 'name', accessorKey: 'name', header: 'Name' }]

function Harness({ onCellContextMenu }: { onCellContextMenu?: (rowId: string, colId: string, x: number, y: number) => void }) {
  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getRowId: (row) => row.id, getCoreRowModel: getCoreRowModel() })
  return (
    <table>
      <DataGridBody table={table} onCellContextMenu={onCellContextMenu} />
    </table>
  )
}

describe('DataGridCell context-menu threading', () => {
  it('calls the supplied body hook with row, column, and coordinates', () => {
    const onCellContextMenu = vi.fn()
    render(<Harness onCellContextMenu={onCellContextMenu} />)
    fireEvent.contextMenu(screen.getByText('Acme'), { clientX: 12, clientY: 34 })
    expect(onCellContextMenu).toHaveBeenCalledWith('a1', 'name', 12, 34)
  })

  it('does not throw when the hook is omitted', () => {
    render(<Harness />)
    fireEvent.contextMenu(screen.getByText('Acme'))
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })
})
