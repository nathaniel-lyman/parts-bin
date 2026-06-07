import { type Table } from '@tanstack/react-table'
import { DataGridRow } from './DataGridRow'

export function DataGridBody<TData>({ table }: { table: Table<TData> }) {
  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <DataGridRow key={row.id} row={row} />
      ))}
    </tbody>
  )
}

