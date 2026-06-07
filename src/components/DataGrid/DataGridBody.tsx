import { type Table } from '@tanstack/react-table'
import { DataGridRow } from './DataGridRow'

interface Props<TData> {
  table: Table<TData>
  enableRowSelection?: boolean
  rowSelection?: Record<string, boolean>
  getRowLabel?: (row: TData, rowId: string) => string
  onToggleRow?: (id: string) => void
  onCellContextMenu?: (rowId: string, colId: string, clientX: number, clientY: number) => void
}

function defaultRowLabel<TData>(row: TData, rowId: string): string {
  const record = row as Record<string, unknown>
  return String(record.name ?? record.account ?? rowId)
}

export function DataGridBody<TData>({
  table,
  enableRowSelection,
  rowSelection = {},
  getRowLabel = defaultRowLabel,
  onToggleRow,
  onCellContextMenu,
}: Props<TData>) {
  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <DataGridRow
          key={row.id}
          row={row}
          enableRowSelection={enableRowSelection}
          selected={rowSelection[row.id] === true}
          rowLabel={getRowLabel(row.original, row.id)}
          onToggleRow={onToggleRow}
          onCellContextMenu={onCellContextMenu}
        />
      ))}
    </tbody>
  )
}
