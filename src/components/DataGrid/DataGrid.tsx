import { useEffect, useMemo, useRef, useState } from 'react'
import './columnMeta'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type Row,
} from '@tanstack/react-table'
import { useGridViewState } from '../../hooks/useGridViewState'
import { canHideColumn, canSortColumn } from './normalize'
import { gridReducer } from './reducers'
import { densityClass, pinnedLeafGroups } from './selectors'
import { hydrate } from './state'
import { ledgerFilterFn } from './filtering'
import { serializeGridQuery, toGridQuery, type GridQuery } from './query'
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
  enableHeaderFilters?: boolean
  enableRowSelection?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  manualPagination?: boolean
  totalRowCount?: number
  onQueryChange?: (query: GridQuery) => void
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
      type: column.meta?.type,
      options: column.meta?.options,
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
  const {
    rows,
    columns,
    getRowId,
    globalFilterFn,
    loading,
    error,
    enableHeaderFilters,
    enableRowSelection,
    manualSorting,
    manualFiltering,
    manualPagination,
    totalRowCount,
    onQueryChange,
  } = props
  const isControlled = props.state !== undefined && props.onStateChange !== undefined
  const isServerMode = Boolean(manualSorting || manualFiltering || manualPagination)
  const [seed] = useState(() => hydrate({ initialState: props.initialState }))
  const view = useGridViewState(seed, columns)
  const state = isControlled ? props.state! : view.state

  const dispatch = (action: GridAction) => {
    if (isControlled) props.onStateChange!(gridReducer(state, action, columns))
    else view.dispatch(action)
  }

  const columnDefs = useMemo(() => columns.map(toColumnDef), [columns])
  const serializedQuery = serializeGridQuery(toGridQuery(state))
  const lastSerializedQuery = useRef('')

  useEffect(() => {
    if (!isServerMode || !onQueryChange || serializedQuery === lastSerializedQuery.current) return
    lastSerializedQuery.current = serializedQuery
    onQueryChange(toGridQuery(state))
    // serializedQuery is the stable change key for the query-relevant state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServerMode, onQueryChange, serializedQuery])

  const effectiveGlobalFilterFn = (row: Row<TData>, _id: string, value: string) => {
    if (globalFilterFn) return globalFilterFn(row.original, value)
    const needle = String(value ?? '').toLowerCase()
    return Object.values(row.original as Record<string, unknown>).some((cell) => String(cell ?? '').toLowerCase().includes(needle))
  }

  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data: rows,
    columns: columnDefs,
    getRowId,
    state: {
      sorting: state.sorting,
      globalFilter: state.globalFilter,
      columnFilters: state.columnFilters,
      columnVisibility: state.columnVisibility,
      columnOrder: state.columnOrder,
      columnSizing: state.columnSizing,
      columnPinning: state.columnPinning,
      pagination: state.pagination,
      rowSelection: state.rowSelection,
    },
    defaultColumn: {
      filterFn: ledgerFilterFn as FilterFn<TData>,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.sorting) : updater
      dispatch({ type: 'setSorting', sorting: next })
    },
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.globalFilter) : updater
      dispatch({ type: 'SET_GLOBAL_FILTER', value: next })
    },
    onColumnFiltersChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnFilters) : updater
      dispatch({ type: 'SET_COLUMN_FILTERS', columnFilters: next })
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnVisibility) : updater
      dispatch({ type: 'setColumnVisibility', columnVisibility: next })
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnOrder) : updater
      dispatch({ type: 'setColumnOrder', columnOrder: next })
    },
    globalFilterFn: effectiveGlobalFilterFn,
    manualSorting,
    manualFiltering,
    manualPagination,
    pageCount: manualPagination && totalRowCount != null ? Math.ceil(totalRowCount / state.pagination.pageSize) : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
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
      <DataGridToolbar
        columns={columns}
        columnVisibility={state.columnVisibility}
        globalFilter={state.globalFilter}
        density={state.density}
        dispatch={dispatch}
      />
      <table className="w-full border-collapse">
        <DataGridHeader
          table={table}
          dispatch={dispatch}
          columnSizing={state.columnSizing}
          columns={columns}
          columnPinning={state.columnPinning}
          columnFilters={state.columnFilters}
          enableHeaderFilters={enableHeaderFilters}
          enableRowSelection={enableRowSelection}
          isServerMode={isServerMode}
        />
        {!loading && error === undefined && rowCount > 0 && <DataGridBody table={table} />}
      </table>
      {loading && <DataGridLoadingState />}
      {!loading && error !== undefined && <DataGridErrorState error={error} />}
      {!loading && error === undefined && rowCount === 0 && <DataGridEmptyState query={state.globalFilter || undefined} />}
    </div>
  )
}
