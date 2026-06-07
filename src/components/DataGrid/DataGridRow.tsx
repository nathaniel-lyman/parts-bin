import { type Row } from '@tanstack/react-table'
import { DataGridCell } from './DataGridCell'

export function DataGridRow<TData>({ row }: { row: Row<TData> }) {
  return (
    <tr className="group border-t border-line hover:bg-surface-2" style={{ height: 'var(--row-h)' }}>
      {row.getVisibleCells().map((cell) => (
        <DataGridCell key={cell.id} cell={cell} />
      ))}
    </tr>
  )
}
