import { useMemo, useState } from 'react'
import './columnMeta'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table'
import { useGridViewState } from '../../hooks/useGridViewState'
import { canHideColumn, canSortColumn } from './normalize'
import { gridReducer } from './reducers'
import { densityClass, pinnedLeafGroups } from './selectors'
import { hydrate } from './state'
import { DataGridBody } from './DataGridBody'
import { DataGridEmptyState } from './DataGridEmptyState'
import { DataGridErrorState } from './DataGridErrorState'
import { DataGridHeader } from './DataGridHeader'
import { DataGridLoadingState } from './DataGridLoadingState'
import { DataGridToolbar } from './DataGridToolbar'
import type { GridAction, LedgerGridColumn, LedgerGridState } from './types'

export interface DataGridProps<TData> {
  rows: TData[]
  columns: LedgerGridColumn<TData>[]
  getRowId: (row: TData) => string
  initialState?: Partial<LedgerGridState>
  globalFilterFn?: (row: TData, value: string) => boolean
  state?: LedgerGridState
  onStateChange?: (next: LedgerGridState) => void
  loading?: boolean
  error?: unknown
}

function toColumnDef<TData>(column: LedgerGridColumn<TData>): ColumnDef<TData> {
  const base: ColumnDef<TData> = {
    id: column.id,
    header: typeof column.header === 'string' ? column.header : () => column.header,
    enableSorting: column.sortable ?? canSortColumn(column.id),
    enableHiding: column.hideable ?? canHideColumn(column.id),
    meta: {
      align: column.meta?.align ?? column.align,
      resizable: column.meta?.resizable ?? (column.resizable !== false),
    },
    size: column.width,
    minSize: column.minWidth,
    maxSize: column.maxWidth,
    cell: column.cell
      ? (ctx) => column.cell!({ value: ctx.getValue(), row: ctx.row.original, rowId: ctx.row.id })
      : undefined,
  }

  if (column.accessorFn) return { ...base, accessorFn: column.accessorFn }
  if (column.accessorKey) return { ...base, accessorKey: column.accessorKey as string }
  return base
}

export function DataGrid<TData>(props: DataGridProps<TData>) {
  const { rows, columns, getRowId, globalFilterFn, loading, error } = props
  const isControlled = props.state !== undefined && props.onStateChange !== undefined
  const [seed] = useState(() => hydrate({ initialState: props.initialState }))
  const view = useGridViewState(seed, columns)
  const state = isControlled ? props.state! : view.state

  const dispatch = (action: GridAction) => {
    if (isControlled) props.onStateChange!(gridReducer(state, action, columns))
    else view.dispatch(action)
  }

  const columnDefs = useMemo(() => columns.map(toColumnDef), [columns])

  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data: rows,
    columns: columnDefs,
    getRowId,
    state: {
      sorting: state.sorting,
      globalFilter: state.globalFilter,
      columnVisibility: state.columnVisibility,
      columnOrder: state.columnOrder,
      columnSizing: state.columnSizing,
      columnPinning: state.columnPinning,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.sorting) : updater
      dispatch({ type: 'setSorting', sorting: next })
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.globalFilter) : updater
      dispatch({ type: 'setGlobalFilter', globalFilter: next })
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnVisibility) : updater
      dispatch({ type: 'setColumnVisibility', columnVisibility: next })
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnOrder) : updater
      dispatch({ type: 'setColumnOrder', columnOrder: next })
    },
    globalFilterFn: globalFilterFn
      ? (row: Row<TData>, _id: string, value: string) => globalFilterFn(row.original, value)
      : 'auto',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rowCount = table.getRowModel().rows.length
  const pinnedGroups = pinnedLeafGroups(table.getVisibleLeafColumns().map((column) => column.id), state.columnPinning)

  return (
    <div
      className={`rounded-[2px] border border-line bg-surface ${densityClass(state.density)}`}
      data-pinned-left={pinnedGroups.left.length}
      data-pinned-center={pinnedGroups.center.length}
      data-pinned-right={pinnedGroups.right.length}
    >
      <DataGridToolbar columns={columns} columnVisibility={state.columnVisibility} density={state.density} dispatch={dispatch} />
      <table className="w-full border-collapse">
        <DataGridHeader
          table={table}
          dispatch={dispatch}
          columnSizing={state.columnSizing}
          columns={columns}
          columnPinning={state.columnPinning}
        />
        {!loading && error === undefined && rowCount > 0 && <DataGridBody table={table} />}
      </table>
      {loading && <DataGridLoadingState />}
      {!loading && error !== undefined && <DataGridErrorState error={error} />}
      {!loading && error === undefined && rowCount === 0 && <DataGridEmptyState query={state.globalFilter || undefined} />}
    </div>
  )
}
