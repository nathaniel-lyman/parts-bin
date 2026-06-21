import './columnMeta'
import { flexRender, type Cell, type Header, type Row, type Table } from '@tanstack/react-table'

interface Props<TData> {
  table: Table<TData>
  columnId: string | null
  width?: number
  maxRows?: number
}

function renderHeader<TData>(header: Header<TData, unknown>) {
  return flexRender(header.column.columnDef.header, header.getContext())
}

function renderCell<TData>(cell: Cell<TData, unknown>) {
  return flexRender(cell.column.columnDef.cell, cell.getContext())
}

function cellsForColumn<TData>(rows: Row<TData>[], columnId: string, maxRows: number) {
  return rows
    .slice(0, maxRows)
    .map((row) => row.getVisibleCells().find((cell) => cell.column.id === columnId))
    .filter((cell): cell is Cell<TData, unknown> => cell !== undefined)
}

export function DataGridColumnDragOverlay<TData>({
  table,
  columnId,
  width,
  maxRows = 18,
}: Props<TData>) {
  if (!columnId) return null

  const header = table
    .getHeaderGroups()
    .flatMap((group) => group.headers)
    .find((item) => item.column.id === columnId)
  if (!header) return null

  const rows = table.getRowModel().rows
  const cells = cellsForColumn(rows, columnId, maxRows)
  const align = header.column.columnDef.meta?.align

  return (
    <div
      className="pointer-events-none overflow-hidden rounded-md border border-line bg-surface text-ink opacity-80 shadow-dropdown"
      data-testid="column-drag-overlay"
      data-column-id={columnId}
      style={{ width }}
    >
      <div className={`border-b border-line bg-surface-2 px-3 py-2 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
        <span className="micro">{renderHeader(header)}</span>
      </div>
      {cells.map((cell) => {
        const cellAlign = cell.column.columnDef.meta?.align
        return (
          <div
            key={cell.id}
            className={`border-b border-line ${cellAlign === 'right' ? 'text-right' : cellAlign === 'center' ? 'text-center' : 'text-left'}`}
            style={{ height: 'var(--row-h)', padding: 'var(--cell-pad)' }}
          >
            {renderCell(cell)}
          </div>
        )
      })}
    </div>
  )
}
