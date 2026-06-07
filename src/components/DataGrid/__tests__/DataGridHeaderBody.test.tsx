import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { DataGridBody } from '../DataGridBody'
import { DataGridHeader } from '../DataGridHeader'

interface Item { id: string; name: string; mrr: number }
const data: Item[] = [
  { id: '1', name: 'Acme', mrr: 30 },
  { id: '2', name: 'Beta', mrr: 10 },
]
const columns: ColumnDef<Item>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'mrr', accessorKey: 'mrr', header: 'MRR', meta: { align: 'right' } },
]

function Harness() {
  const [sorting, setSorting] = useState<SortingState>([])
  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <table>
      <DataGridHeader table={table} />
      <DataGridBody table={table} />
    </table>
  )
}

describe('DataGridHeader / DataGridBody', () => {
  it('headers expose aria-sort=none initially', () => {
    render(<Harness />)
    expect(screen.getByRole('columnheader', { name: /MRR/ })).toHaveAttribute('aria-sort', 'none')
  })

  it('clicking a sortable header sorts and updates aria-sort', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('columnheader', { name: /MRR/ }))
    expect(screen.getByRole('columnheader', { name: /MRR/ })).toHaveAttribute('aria-sort', 'descending')
  })

  it('body renders one row per data item', () => {
    render(<Harness />)
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('marks the body virtualized when row windowing is enabled', () => {
    function VirtualHarness() {
      // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
      // eslint-disable-next-line react-hooks/incompatible-library
      const table = useReactTable({
        data: Array.from({ length: 1000 }, (_, index) => ({ id: String(index), name: `Row ${index}`, mrr: index })),
        columns,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
      })
      return (
        <table>
          <DataGridBody table={table} enableVirtualization />
        </table>
      )
    }

    const { container } = render(<VirtualHarness />)
    expect(container.querySelector('tbody')).toHaveAttribute('data-virtualized', 'true')
    expect(Number(container.querySelector('tbody')?.getAttribute('data-total-size'))).toBeGreaterThan(1000)
  })
})
