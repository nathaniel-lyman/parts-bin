import { useMemo, useState } from 'react'
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable,
  type SortingState, type VisibilityState,
} from '@tanstack/react-table'
import type { Account } from '../../data/types'
import type { ColumnVisibility } from '../../hooks/useColumnVisibility'
import { buildColumns, accountGlobalFilter } from './columns'
import { Toolbar } from './Toolbar'

interface Props {
  accounts: Account[]
  visibility: ColumnVisibility
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
  onNew?: () => void
  onToggleColumn?: (c: 'name' | 'arr' | 'since') => void
  onResetColumns?: () => void
}

export function DataTable({ accounts, visibility, onEdit, onDelete, onNew, onToggleColumn, onResetColumns }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'mrr', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [segments, setSegments] = useState<string[]>([])

  const columns = useMemo(() => buildColumns(onEdit, onDelete), [onEdit, onDelete])

  // map our visibility -> TanStack VisibilityState (account name column id is 'account')
  const columnVisibility: VisibilityState = {
    account: visibility.name,
    arr: visibility.arr,
    since: visibility.since,
  }

  const filtered = useMemo(
    () => (segments.length ? accounts.filter((a) => segments.includes(a.segment)) : accounts),
    [accounts, segments],
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: accountGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-[2px] border border-line bg-surface">
      <Toolbar
        search={globalFilter}
        onSearch={setGlobalFilter}
        segments={segments}
        onToggleSegment={(s) => setSegments((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
        visibility={visibility}
        onToggleColumn={onToggleColumn}
        onResetColumns={onResetColumns}
        onNew={onNew}
      />
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-surface-2">
              {hg.headers.map((h) => {
                const sorted = h.column.getIsSorted()
                const align = h.column.columnDef.meta?.align
                return (
                  <th
                    key={h.id}
                    aria-sort={h.column.getCanSort() ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
                    onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                    className={`micro select-none px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${h.column.getCanSort() ? 'cursor-pointer' : ''}`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {sorted && <span className="text-accent"> {sorted === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="group border-t border-line h-10 hover:bg-surface-2">
              {row.getVisibleCells().map((cell) => {
                const align = cell.column.columnDef.meta?.align
                return (
                  <td key={cell.id} className={`px-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {table.getRowModel().rows.length === 0 && (
        <div className="px-3 py-8 text-center text-muted">
          ∅ No results{globalFilter && <> for “{globalFilter}”</>} —{' '}
          <button
            className="text-accent underline"
            onClick={() => { setGlobalFilter(''); setSegments([]) }}
          >
            clear filters
          </button>
        </div>
      )}
    </div>
  )
}
