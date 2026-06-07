import { flexRender, type Cell } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
  }
}

export function DataGridCell<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const align = cell.column.columnDef.meta?.align
  return (
    <td className={`px-3 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}

