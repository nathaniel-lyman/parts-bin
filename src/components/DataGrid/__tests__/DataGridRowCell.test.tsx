import { render, screen } from '@testing-library/react'
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { DataGridRow } from '../DataGridRow'
import { GridRuntimeProvider } from '../GridRuntimeContext'

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

function SelectedRow() {
  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getRowId: (row) => row.id, getCoreRowModel: getCoreRowModel() })
  return table.getRowModel().rows.map((row) => <DataGridRow key={row.id} row={row} selected />)
}

function FlashHarness({ mrr, name = 'Acme' }: { mrr: number; name?: string }) {
  const localRows: Item[] = [{ id: '1', name, mrr }]
  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: localRows, columns, getRowId: (row) => row.id, getCoreRowModel: getCoreRowModel() })
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
        <GridRuntimeProvider
          value={{
            enableRowSelection: false,
            visibleColumnIds: ['name', 'mrr'],
            dragPreview: {
              activeId: 'name',
              overId: 'mrr',
              projectedOrder: ['mrr', 'name'],
              offsets: { mrr: -140 },
            },
          }}
        >
          {table.getRowModel().rows.map((row) => (
            <DataGridRow key={row.id} row={row} />
          ))}
        </GridRuntimeProvider>
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

  it('tints the selected row with accent-soft and holds it on hover', () => {
    render(
      <table>
        <tbody>
          <SelectedRow />
        </tbody>
      </table>,
    )
    const row = screen.getByText('Acme').closest('tr')!
    expect(row.className).toContain('bg-accent-soft')
    // Selection must not be overridden by the neutral hover tint.
    expect(row.className).not.toContain('hover:bg-surface-2')
  })

  it('flashes a cell on value change — up for an increase, down for a decrease, never on first render', () => {
    const { rerender, container } = render(<FlashHarness mrr={9} />)
    // No flash on initial mount (prev === current value).
    expect(container.querySelector('[data-testid="cell-flash"]')).toBeNull()
    rerender(<FlashHarness mrr={12} />)
    expect(container.querySelector('[data-testid="cell-flash"]')!.className).toContain('cell-flash-up')
    rerender(<FlashHarness mrr={4} />)
    expect(container.querySelector('[data-testid="cell-flash"]')!.className).toContain('cell-flash-down')
  })

  it('does not flash when an unrelated re-render leaves the value unchanged', () => {
    const { rerender, container } = render(<FlashHarness mrr={9} name="Acme" />)
    rerender(<FlashHarness mrr={9} name="Acme Corp" />)
    // The mrr cell value did not change, so it must not flash on this re-render.
    const cells = Array.from(container.querySelectorAll('td'))
    const mrrCell = cells.find((td) => td.getAttribute('data-column-id') === 'mrr')!
    expect(mrrCell.querySelector('[data-testid="cell-flash"]')).toBeNull()
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
