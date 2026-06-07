import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './columnMeta'
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
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
import { useSavedViews } from '../../hooks/useSavedViews'
import { canHideColumn, canSortColumn } from './normalize'
import { gridReducer } from './reducers'
import { densityClass, pinnedLeafGroups, selectAllState, selectionCount } from './selectors'
import { hydrate } from './state'
import { ledgerFilterFn } from './filtering'
import { serializeGridQuery, toGridQuery, type GridQuery } from './query'
import { copyToClipboard, downloadCSV, serializeCSV, serializeCell, serializeTSV } from './export'
import { projectView } from './persistence'
import { resolveCopyIntent } from './keyboard'
import { DataGridBulkActions } from './DataGridBulkActions'
import { DataGridBody } from './DataGridBody'
import { DataGridContextMenu } from './DataGridContextMenu'
import { DataGridEmptyState } from './DataGridEmptyState'
import { DataGridErrorState } from './DataGridErrorState'
import { DataGridFooter } from './DataGridFooter'
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
  enablePagination?: boolean
  enableExport?: boolean
  enableSavedViews?: boolean
  persistenceKey?: string
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
    enablePagination = true,
    enableExport,
    enableSavedViews,
    persistenceKey,
    totalRowCount,
    onQueryChange,
  } = props
  const isControlled = props.state !== undefined && props.onStateChange !== undefined
  const isServerMode = Boolean(manualSorting || manualFiltering || manualPagination)
  const [seed] = useState(() => hydrate({ initialState: props.initialState }))
  const [menu, setMenu] = useState<{ x: number; y: number; rowId: string; colId: string } | null>(null)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const view = useGridViewState(seed, columns)
  const savedViews = useSavedViews()
  const state = isControlled ? props.state! : view.state
  const paginationEnabled = enablePagination || manualPagination
  const savedViewsEnabled = !isControlled && (enableSavedViews || persistenceKey !== undefined)

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
      rowPinning: state.rowPinning,
    },
    defaultColumn: {
      filterFn: ledgerFilterFn as unknown as FilterFn<TData>,
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
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.pagination) : updater
      if (next.pageIndex !== state.pagination.pageIndex) dispatch({ type: 'setPageIndex', pageIndex: next.pageIndex })
      if (next.pageSize !== state.pagination.pageSize) dispatch({ type: 'setPageSize', pageSize: next.pageSize })
    },
    globalFilterFn: effectiveGlobalFilterFn,
    manualSorting,
    manualFiltering,
    manualPagination,
    enableRowPinning: true,
    keepPinnedRows: true,
    pageCount: manualPagination && totalRowCount != null ? Math.ceil(totalRowCount / state.pagination.pageSize) : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(paginationEnabled && !manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const rowCount = table.getRowModel().rows.length
  const visibleRows = table.getRowModel().rows
  const visibleIds = visibleRows.map((row) => row.id)
  const visibleData = visibleRows.map((row) => row.original)
  const exportData = (manualFiltering ? table.getRowModel().rows : table.getFilteredRowModel().rows).map((row) => row.original)
  const footerTotalRows = manualPagination ? (totalRowCount ?? rowCount) : table.getFilteredRowModel().rows.length
  const footerPageCount = manualPagination
    ? Math.max(1, Math.ceil(footerTotalRows / state.pagination.pageSize))
    : Math.max(1, table.getPageCount())
  const selCount = selectionCount(state.rowSelection)
  const allState = selectAllState(state.rowSelection, visibleIds)
  const pinnedGroups = pinnedLeafGroups(table.getVisibleLeafColumns().map((column) => column.id), state.columnPinning)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    dispatch({ type: 'REORDER_COLUMN', activeId: String(active.id), overId: String(over.id) })
  }
  const selCountRef = useRef(selCount)
  const menuRef = useRef(menu)

  selCountRef.current = selCount
  menuRef.current = menu

  const resolveCellValue = useCallback(
    (row: TData, columnId: string): unknown => {
      const column = columns.find((item) => item.id === columnId)
      if (!column) return ''
      if (column.accessorFn) return column.accessorFn(row)
      if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey as string]
      return ''
    },
    [columns],
  )

  const copyCell = useCallback(
    (rowId: string, colId: string) => {
      const row = visibleData.find((item) => getRowId(item) === rowId) ?? rows.find((item) => getRowId(item) === rowId)
      if (!row) return
      void copyToClipboard(serializeCell(resolveCellValue(row, colId)))
    },
    [getRowId, resolveCellValue, rows, visibleData],
  )

  const copyRow = useCallback(
    (rowId: string) => {
      const row = visibleData.find((item) => getRowId(item) === rowId) ?? rows.find((item) => getRowId(item) === rowId)
      if (!row) return
      void copyToClipboard(serializeTSV([row], columns, {
        getRowId,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        includeHeader: false,
      }))
    },
    [columns, getRowId, rows, state.columnOrder, state.columnVisibility, visibleData],
  )

  const copySelection = useCallback(() => {
    void copyToClipboard(serializeTSV(visibleData, columns, {
      getRowId,
      columnOrder: state.columnOrder,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    }))
  }, [columns, getRowId, state.columnOrder, state.columnVisibility, state.rowSelection, visibleData])

  const exportCsv = useCallback(() => {
    downloadCSV('ledger-accounts.csv', serializeCSV(exportData, columns, {
      getRowId,
      columnOrder: state.columnOrder,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    }))
  }, [columns, exportData, getRowId, state.columnOrder, state.columnVisibility, state.rowSelection])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const active = document.activeElement
      const editableInput =
        active instanceof HTMLInputElement &&
        ['email', 'number', 'password', 'search', 'tel', 'text', 'url'].includes(active.type)
      const inEditableTarget =
        editableInput ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      const intent = resolveCopyIntent(event, { hasSelection: selCountRef.current > 0, inEditableTarget })
      if (!intent) return
      if (intent === 'selection') copySelection()
      else if (menuRef.current) copyCell(menuRef.current.rowId, menuRef.current.colId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copyCell, copySelection])

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
        enableExport={enableExport}
        onExportCsv={exportCsv}
        savedViews={savedViewsEnabled ? savedViews.views.map((item) => ({ id: item.id, name: item.name })) : undefined}
        onSaveView={(name) => savedViews.create(name, projectView(state))}
        onApplyView={(id) => savedViews.apply(id, view.applyView)}
        onDeleteView={(id) => savedViews.remove(id)}
        onResetView={() => savedViews.reset(view.applyView)}
      />
      {enableRowSelection && selCount > 0 && (
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <DataGridBulkActions count={selCount} onClear={() => dispatch({ type: 'CLEAR_SELECTION' })} />
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div ref={setScrollElement} className="max-h-[640px] overflow-auto" data-testid="datagrid-scroll">
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
              selectAll={allState}
              onSelectAll={(select) => dispatch({ type: 'SELECT_ALL_VISIBLE', ids: visibleIds, select })}
              dndProvider={false}
            />
            {!loading && error === undefined && rowCount > 0 && (
              <DataGridBody
                table={table}
                enableRowSelection={enableRowSelection}
                rowSelection={state.rowSelection}
                scrollElement={scrollElement}
                enableVirtualization={rowCount > 100}
                onToggleRow={(id) => dispatch({ type: 'TOGGLE_ROW', id })}
                onCellContextMenu={(rowId, colId, x, y) => setMenu({ rowId, colId, x, y })}
              />
            )}
          </table>
        </div>
      </DndContext>
      {paginationEnabled && (
        <DataGridFooter
          pageIndex={state.pagination.pageIndex}
          pageSize={state.pagination.pageSize}
          pageCount={footerPageCount}
          totalRowCount={footerTotalRows}
          onPageIndexChange={(pageIndex) => dispatch({ type: 'setPageIndex', pageIndex })}
          onPageSizeChange={(pageSize) => dispatch({ type: 'setPageSize', pageSize })}
        />
      )}
      {loading && <DataGridLoadingState />}
      {!loading && error !== undefined && <DataGridErrorState error={error} />}
      {!loading && error === undefined && rowCount === 0 && <DataGridEmptyState query={state.globalFilter || undefined} />}
      {menu && (
        <DataGridContextMenu
          x={menu.x}
          y={menu.y}
          selectionCount={selCount}
          onCopyCell={() => copyCell(menu.rowId, menu.colId)}
          onCopyRow={() => copyRow(menu.rowId)}
          onCopySelection={copySelection}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  )
}
