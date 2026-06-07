import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'

export function DataGridCell<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const align = cell.column.columnDef.meta?.align
  return (
    <td className={`${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} style={{ padding: 'var(--cell-pad)' }}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}
