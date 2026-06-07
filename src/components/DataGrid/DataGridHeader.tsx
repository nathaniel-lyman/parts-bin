import { flexRender, type Header, type Table } from '@tanstack/react-table'

function HeaderCell<TData>({ header }: { header: Header<TData, unknown> }) {
  const sorted = header.column.getIsSorted()
  const canSort = header.column.getCanSort()
  const align = header.column.columnDef.meta?.align

  return (
    <th
      aria-sort={canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
      className={`micro select-none px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${canSort ? 'cursor-pointer' : ''}`}
    >
      <span>
        {flexRender(header.column.columnDef.header, header.getContext())}
        {sorted && <span className="text-accent"> {sorted === 'asc' ? '▲' : '▼'}</span>}
      </span>
    </th>
  )
}

export function DataGridHeader<TData>({ table }: { table: Table<TData> }) {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="bg-surface-2">
          {headerGroup.headers.map((header) => (
            <HeaderCell key={header.id} header={header} />
          ))}
        </tr>
      ))}
    </thead>
  )
}

