import { type Row } from '@tanstack/react-table'
import { DataGridCell } from './DataGridCell'

export function DataGridRow<TData>({ row }: { row: Row<TData> }) {
  return (
    <tr className="group h-10 border-t border-line hover:bg-surface-2">
      {row.getVisibleCells().map((cell) => (
        <DataGridCell key={cell.id} cell={cell} />
      ))}
    </tr>
  )
}

