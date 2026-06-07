import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'
import type { MouseEvent } from 'react'

export function DataGridCell<TData>({
  cell,
  onContextMenu,
}: {
  cell: Cell<TData, unknown>
  onContextMenu?: (event: MouseEvent<HTMLTableCellElement>) => void
}) {
  const align = cell.column.columnDef.meta?.align
  return (
    <td
      className={`${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      style={{ padding: 'var(--cell-pad)' }}
      onContextMenu={onContextMenu}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}
