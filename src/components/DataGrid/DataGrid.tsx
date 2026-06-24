import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import './columnMeta'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type Row,
} from '@tanstack/react-table'
import { useGridViewState } from './useGridViewState'
import { bootGridSeed, useGridPersistence } from './useGridPersistence'
import { useSavedViews } from './useSavedViews'
import { useColumnDragPreview } from './useColumnDragPreview'
import { useScrollMetrics } from './useScrollMetrics'
import { usePinnedColumnOffsets } from './usePinnedColumnOffsets'
import { useGridSelectionFocus } from './useGridSelectionFocus'
import { useGridClipboard } from './useGridClipboard'
import { isActionRenderColumn, isLockPositionColumn, lockedColumnIds } from './normalize'
import { gridReducer } from './reducers'
import { densityClass, pinnedLeafGroups, rowHeightForDensity, selectAllState, selectionCount } from './selectors'
import { hydrate } from './state'
import { ledgerFilterFn } from './filtering'
import { serializeGridQuery, toGridQuery, type GridQuery } from './query'
import { projectView } from './persistence'
import { keyToIntent, moveFocus } from './keyboard'
import { computeColumnRange } from './virtualization'
import { DataGridBulkActions } from './DataGridBulkActions'
import { DataGridBody } from './DataGridBody'
import { DataGridColumnDragOverlay } from './DataGridColumnDragOverlay'
import { DataGridContextMenu } from './DataGridContextMenu'
import { DataGridEmptyState } from './DataGridEmptyState'
import { DataGridErrorState } from './DataGridErrorState'
import { DataGridFooter } from './DataGridFooter'
import { DataGridHeader } from './DataGridHeader'
import { DataGridLoadingState, DataGridSkeletonRows } from './DataGridLoadingState'
import { DataGridToolbar } from './DataGridToolbar'
import { fitColumnWidth, measureColumnContentWidths } from './autofit'
import { computeAggregates, formatAggregate, resolveAggregate } from './aggregation'
import { formatDataGridNumber, isNumericColumnType } from './numberFormat'
import type { EditMode } from './editing'
import { useInlineEditing } from './useInlineEditing'
import { DataGridAggregationFooter } from './DataGridAggregationFooter'
import { GridRuntimeProvider, type GridRuntime } from './GridRuntimeContext'
import type { ColumnVirtualWindow, DataGridColumn, DataGridNumberFormat, DataGridState, GridAction } from './types'

export interface DataGridProps<TData> {
  rows: TData[]
  columns: DataGridColumn<TData>[]
  getRowId: (row: TData) => string
  initialState?: Partial<DataGridState>
  globalFilterFn?: (row: TData, value: string) => boolean
  state?: DataGridState
  onStateChange?: (next: DataGridState) => void
  loading?: boolean
  error?: unknown
  enableHeaderFilters?: boolean
  enableRowSelection?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  manualPagination?: boolean
  enablePagination?: boolean
  enableExport?: boolean
  enableExcelExport?: boolean
  exportFilename?: string
  /** True when the consumer has selected every row matching the current server query. */
  allMatchingRowsSelected?: boolean
  /** Server-mode only: select every row matching the current filters/sort, not just loaded rows. */
  onSelectAllMatching?: (query: GridQuery) => void
  /** Clears the consumer-owned all-matching selection state. */
  onClearAllMatching?: () => void
  /** Server-mode only: export every row matching the current filters/sort as CSV. */
  onExportAllCsv?: (query: GridQuery) => void
  /** Server-mode only: export every row matching the current filters/sort as XLSX. */
  onExportAllXlsx?: (query: GridQuery) => void
  enableSavedViews?: boolean
  persistenceKey?: string
  totalRowCount?: number
  onQueryChange?: (query: GridQuery) => void
  onContextChange?: (context: DataGridContextSnapshot<TData>) => void
  /** Shows the toolbar quick filter. Disable when the consumer supplies search elsewhere. */
  enableQuickFilter?: boolean
  /** Placeholder text for the toolbar quick filter. */
  quickFilterPlaceholder?: string
  /** Enables row grouping (toolbar chips + "Group by" in column menus). Client-side data only. */
  enableGrouping?: boolean
  /**
   * Enables inline editing for columns marked `editable`. Called with the validated patch
   * (keyed by accessorKey) when an edit commits with changes. Client-side data only.
   */
  onRowUpdate?: (rowId: string, patch: Partial<TData>, row: TData) => void
  /** 'cell' edits one cell at a time (default); 'row' opens every editable cell in the row. */
  editMode?: EditMode
  /** Enables nested rows. Client-side data only; return children for a row or undefined. */
  getSubRows?: (row: TData, index: number) => TData[] | undefined
  /** Overrides which rows can expand for tree/detail rendering. Client-side data only. */
  getRowCanExpand?: (row: TData) => boolean
  /** Renders an expanded detail panel below a data row. Client-side data only. */
  renderDetailPanel?: (ctx: { row: TData; rowId: string }) => ReactNode
  /** Column that receives tree indentation/expand controls. Defaults to the first visible data column. */
  treeColumnId?: string
  /** Row count above which body rows are windowed (virtualized). Default 100. */
  virtualizeRowThreshold?: number
}

export interface DataGridContextSnapshot<TData> {
  totalRowCount: number
  visibleRowCount: number
  selectedRowCount: number
  loadedSelectedRowCount: number
  allMatchingRowsSelected: boolean
  visibleRows: TData[]
  selectedRows: TData[]
  globalFilter: string
  columnFilters: DataGridState['columnFilters']
  sorting: DataGridState['sorting']
  savedViews: { id: string; name: string }[]
  currentSavedView?: { id: string; name: string }
  actions: {
    saveCurrentView: (name: string) => string
    applySavedView: (id: string) => void
    resetView: () => void
    clearSelection: () => void
  }
}

function toColumnDef<TData>(
  column: DataGridColumn<TData>,
  numberFormat?: DataGridNumberFormat,
): ColumnDef<TData> {
  const formatValue = (value: unknown, override?: DataGridNumberFormat) =>
    formatDataGridNumber(value, column.type, column.numberFormat, override ? { ...numberFormat, ...override } : numberFormat)
  const base: ColumnDef<TData> = {
    id: column.id,
    header: typeof column.header === 'string' ? column.header : () => column.header,
    enableSorting: column.sortable ?? !isLockPositionColumn(column),
    enableHiding: column.hideable ?? !isLockPositionColumn(column),
    meta: {
      align: column.meta?.align ?? column.align,
      resizable: column.meta?.resizable ?? (column.resizable !== false),
      type: column.meta?.type,
      options: column.meta?.options,
      actions: isActionRenderColumn(column),
    },
    size: column.width,
    minSize: column.minWidth,
    maxSize: column.maxWidth,
    enableGrouping: column.groupable === true,
  }
  const rawValue = (row: TData): unknown =>
    column.accessorFn
      ? column.accessorFn(row)
      : column.accessorKey
        ? (row as Record<string, unknown>)[column.accessorKey as string]
        : undefined
  if (column.cell) {
    base.cell = (ctx) => column.cell!({
      value: rawValue(ctx.row.original),
      formattedValue: formatValue(rawValue(ctx.row.original)),
      formatValue: (format) => formatValue(rawValue(ctx.row.original), format),
      row: ctx.row.original,
      rowId: ctx.row.id,
    })
  } else if (isNumericColumnType(column.type)) {
    base.cell = (ctx) => <span className="num text-ink">{formatValue(ctx.getValue())}</span>
  }

  if (column.accessorFn || column.accessorKey) {
    // Coalesce blank cells to `undefined` so TanStack's direction-independent `sortUndefined: 'last'`
    // pushes empties to the bottom in BOTH sort directions (a custom sortingFn result would be
    // reversed for desc, and sortUndefined only triggers on `undefined`). Custom cells still get the
    // original value via rawValue above; export/aggregation/editing read their own accessors, so this
    // only affects getValue (sort/group/facet) — where a blank already rendered as empty anyway.
    const accessorFn = (row: TData) => {
      const value = rawValue(row)
      return value === null || value === undefined || value === '' ? undefined : value
    }
    return {
      ...base,
      accessorFn,
      sortUndefined: 'last',
      // Optional per-column custom order for non-blank values (blanks are handled by sortUndefined).
      ...(column.comparator ? { sortingFn: (rowA, rowB) => column.comparator!(rowA.original, rowB.original) } : {}),
    }
  }
  return base
}

/** Human sentence describing the current sort, for the live-region announcer. */
function describeSort<TData>(sorting: DataGridState['sorting'], columns: DataGridColumn<TData>[]): string {
  if (sorting.length === 0) return 'Sorting cleared'
  const label = (id: string) => {
    const column = columns.find((item) => item.id === id)
    return typeof column?.header === 'string' ? column.header : id
  }
  return `Sorted by ${sorting.map((sort) => `${label(sort.id)} ${sort.desc ? 'descending' : 'ascending'}`).join(', ')}`
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
    enableExcelExport,
    exportFilename = 'data-grid.csv',
    allMatchingRowsSelected = false,
    onSelectAllMatching,
    onClearAllMatching,
    onExportAllCsv,
    onExportAllXlsx,
    enableSavedViews,
    persistenceKey,
    totalRowCount,
    onQueryChange,
    onContextChange,
    enableQuickFilter,
    quickFilterPlaceholder,
    enableGrouping,
    onRowUpdate,
    editMode = 'cell',
    getSubRows,
    getRowCanExpand,
    renderDetailPanel,
    treeColumnId,
    virtualizeRowThreshold = 100,
  } = props
  const isControlled = props.state !== undefined && props.onStateChange !== undefined
  const isServerMode = Boolean(manualSorting || manualFiltering || manualPagination)
  const matchingSelectionActive = isServerMode && allMatchingRowsSelected
  const groupingActive = Boolean(enableGrouping) && !isServerMode
  const treeActive = getSubRows !== undefined && !isServerMode
  const detailPanelActive = renderDetailPanel !== undefined && !isServerMode
  const expandedActive = groupingActive || treeActive || detailPanelActive
  const editingEnabled = onRowUpdate !== undefined && !isServerMode
  const persistenceEnabled = !isControlled && persistenceKey !== undefined
  const [seed] = useState(() => persistenceEnabled ? bootGridSeed(props.initialState, persistenceKey) : hydrate({ initialState: props.initialState }))
  const [menu, setMenu] = useState<{ x: number; y: number; rowId: string; colId: string } | null>(null)
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)
  const scrollMetrics = useScrollMetrics(scrollElement)
  const [headerFiltersOpen, setHeaderFiltersOpen] = useState(false)
  const view = useGridViewState(seed, columns)
  const {
    views: savedViewItems,
    create: createSavedView,
    remove: removeSavedView,
    apply: applySavedView,
    reset: resetSavedView,
  } = useSavedViews(persistenceKey ? `${persistenceKey}.views` : undefined)
  const state = isControlled ? props.state! : view.state
  const paginationEnabled = enablePagination || manualPagination
  const savedViewsEnabled = !isControlled && (enableSavedViews || persistenceKey !== undefined)

  // Stable dispatch identity. Memoized Row/Cell read their action handlers from a context value
  // whose stability depends on these callbacks not changing each render; an unstable `dispatch`
  // would churn that context and defeat the memoization. The implementation reads the latest
  // state/columns/controlled props through a ref written in a layout effect (never during render,
  // for StrictMode/concurrent safety) so the returned reference is constant for the grid's lifetime.
  const dispatchImplRef = useRef<(action: GridAction) => void>(() => {})
  useLayoutEffect(() => {
    dispatchImplRef.current = (action: GridAction) => {
      if (isControlled) props.onStateChange!(gridReducer(state, action, columns))
      else view.dispatch(action)
    }
  })
  const dispatch = useCallback((action: GridAction) => dispatchImplRef.current(action), [])

  useGridPersistence(state, persistenceEnabled, persistenceKey)

  const columnDefs = useMemo(
    () => columns.map((column) => toColumnDef(column, state.numberFormats[column.id])),
    [columns, state.numberFormats],
  )
  const pageQuery = useMemo(() => toGridQuery(state), [state])
  const allMatchingQuery = useMemo(() => toGridQuery(state, 'allMatching'), [state])
  const serializedQuery = serializeGridQuery(pageQuery)
  const lastSerializedQuery = useRef('')

  useEffect(() => {
    if (!isServerMode || !onQueryChange || serializedQuery === lastSerializedQuery.current) return
    lastSerializedQuery.current = serializedQuery
    onQueryChange(pageQuery)
  }, [isServerMode, onQueryChange, pageQuery, serializedQuery])

  const effectiveGlobalFilterFn = (row: Row<TData>, _id: string, value: string) => {
    if (globalFilterFn) return globalFilterFn(row.original, value)
    const needle = String(value ?? '').toLowerCase()
    return Object.values(row.original as Record<string, unknown>).some((cell) => String(cell ?? '').toLowerCase().includes(needle))
  }

  // Ids of position-locked columns (lockPosition / type:'actions' / legacy id), in column order.
  const lockedColumnIdSet = useMemo(() => new Set(lockedColumnIds(columns)), [columns])
  const effectiveColumnOrder = useMemo(
    () => {
      const ids = columns.map((column) => column.id)
      const free = state.columnOrder.filter((id) => ids.includes(id) && !lockedColumnIdSet.has(id))
      for (const id of ids) {
        if (!lockedColumnIdSet.has(id) && !free.includes(id)) free.push(id)
      }
      const locked = ids.filter((id) => lockedColumnIdSet.has(id))
      return [...free, ...locked]
    },
    [columns, state.columnOrder, lockedColumnIdSet],
  )

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
      columnOrder: effectiveColumnOrder,
      columnSizing: state.columnSizing,
      columnPinning: state.columnPinning,
      pagination: state.pagination,
      rowSelection: state.rowSelection,
      rowPinning: state.rowPinning,
      grouping: groupingActive ? state.grouping : [],
      expanded: expandedActive ? state.expanded : {},
    },
    defaultColumn: {
      filterFn: ledgerFilterFn as FilterFn<TData>,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.sorting) : updater
      dispatch({ type: 'SET_SORTING', sorting: next })
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
      dispatch({ type: 'SET_COLUMN_VISIBILITY', columnVisibility: next })
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.columnOrder) : updater
      dispatch({ type: 'SET_COLUMN_ORDER', columnOrder: next })
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.pagination) : updater
      if (next.pageIndex !== state.pagination.pageIndex) dispatch({ type: 'SET_PAGE_INDEX', pageIndex: next.pageIndex })
      if (next.pageSize !== state.pagination.pageSize) dispatch({ type: 'SET_PAGE_SIZE', pageSize: next.pageSize })
    },
    onGroupingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.grouping) : updater
      dispatch({ type: 'SET_GROUPING', grouping: next })
    },
    onExpandedChange: (updater) => {
      const next = typeof updater === 'function' ? updater(state.expanded) : updater
      dispatch({ type: 'SET_EXPANDED', expanded: next })
    },
    getSubRows: treeActive ? getSubRows : undefined,
    getRowCanExpand: (row) => {
      if (row.getIsGrouped()) return true
      if (getRowCanExpand?.(row.original)) return true
      if (detailPanelActive) return true
      return row.subRows.length > 0
    },
    globalFilterFn: effectiveGlobalFilterFn,
    manualSorting,
    manualFiltering,
    manualPagination,
    enableRowPinning: true,
    keepPinnedRows: true,
    // Keep grouped columns in their configured position instead of TanStack's default reorder.
    groupedColumnMode: false,
    // Expansion lives in our reducer; TanStack must not reset it when grouping/data change.
    autoResetExpanded: false,
    pageCount: manualPagination && totalRowCount != null ? Math.ceil(totalRowCount / state.pagination.pageSize) : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualFiltering
      ? {}
      : { getFilteredRowModel: getFilteredRowModel(), getFacetedRowModel: getFacetedRowModel(), getFacetedUniqueValues: getFacetedUniqueValues() }),
    ...(groupingActive ? { getGroupedRowModel: getGroupedRowModel() } : {}),
    ...(expandedActive ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    ...(paginationEnabled && !manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const visibleRows = table.getRowModel().rows
  const rowCount = visibleRows.length
  const filteredRows = table.getFilteredRowModel().rows
  const visibleLeafColumns = table.getVisibleLeafColumns()
  const centerLeafColumns = table.getCenterVisibleLeafColumns()
  // Group rows have no `original`; selection/copy/context must only ever see leaf rows.
  // These derive off TanStack's already-memoized row model / leaf-column arrays, so they stay
  // referentially stable across renders that don't touch the data (e.g. a selection toggle).
  // That stability is the linchpin: it keeps the clipboard handlers and the GridRuntimeContext
  // value from churning every render, which is what lets the memoized Row/Cell actually skip.
  const visibleLeafRows = useMemo(() => visibleRows.filter((row) => !row.getIsGrouped()), [visibleRows])
  const visibleIds = useMemo(() => visibleLeafRows.map((row) => row.id), [visibleLeafRows])
  const visibleData = useMemo(() => visibleLeafRows.map((row) => row.original), [visibleLeafRows])
  const exportData = useMemo(
    () => (manualFiltering ? visibleRows : filteredRows).map((row) => row.original),
    [manualFiltering, visibleRows, filteredRows],
  )
  const footerTotalRows = manualPagination ? (totalRowCount ?? rowCount) : filteredRows.length
  const footerPageCount = manualPagination
    ? Math.max(1, Math.ceil(footerTotalRows / state.pagination.pageSize))
    : Math.max(1, table.getPageCount())
  const selCount = selectionCount(state.rowSelection)
  // What copySelection would actually copy: selected ∩ currently visible. Hidden-but-selected
  // rows are never serialized, so copy gates and the menu count must use this, not selCount.
  const visibleSelectedCount = visibleData.filter((row) => state.rowSelection[getRowId(row)]).length
  const allState = selectAllState(state.rowSelection, visibleIds)
  const canSelectAllMatching = Boolean(
    isServerMode
    && onSelectAllMatching
    && allState === 'all'
    && footerTotalRows > visibleIds.length,
  )
  const selectionDisplayCount = matchingSelectionActive ? footerTotalRows : selCount

  // Live-region announcer: derive the message during render via the sanctioned set-state-on-changed-
  // value pattern (no effect, no extra paint, StrictMode-idempotent) so a screen reader hears a sort,
  // a filter that changed the result count, or a selection change. Lazy-initialized to the current
  // signatures so nothing is announced on mount; sort wins over filter wins over selection when more
  // than one changed in a single render.
  const sortSig = JSON.stringify(state.sorting)
  const filterSig = JSON.stringify([state.columnFilters, state.globalFilter])
  const [announcer, setAnnouncer] = useState(() => ({ message: '', sortSig, filterSig, sel: selCount }))
  if (sortSig !== announcer.sortSig || filterSig !== announcer.filterSig || selCount !== announcer.sel) {
    const message =
      sortSig !== announcer.sortSig
        ? describeSort(state.sorting, columns)
        : filterSig !== announcer.filterSig
          ? `Filtered: ${footerTotalRows} ${footerTotalRows === 1 ? 'row' : 'rows'}`
          : selCount === 0
            ? 'Selection cleared'
            : `${selCount} ${selCount === 1 ? 'row' : 'rows'} selected`
    setAnnouncer({ message, sortSig, filterSig, sel: selCount })
  }

  const visibleColumnIds = useMemo(() => visibleLeafColumns.map((column) => column.id), [visibleLeafColumns])
  const visibleMovableColumnIds = useMemo(() => visibleColumnIds.filter((id) => !lockedColumnIdSet.has(id)), [visibleColumnIds, lockedColumnIdSet])
  const columnWidthMap = useMemo(
    () => Object.fromEntries(visibleLeafColumns.map((column) => [column.id, state.columnSizing[column.id] ?? column.getSize()])),
    [visibleLeafColumns, state.columnSizing],
  )
  const pinnedGroups = useMemo(() => pinnedLeafGroups(visibleColumnIds, state.columnPinning), [visibleColumnIds, state.columnPinning])
  const rowHeight = rowHeightForDensity(state.density)
  // Sticky offsets must come from RENDERED widths: the w-full table stretches columns past
  // their logical getSize(), and the selection column has no fixed width — so we measure.
  const pinnedColumnOffsets = usePinnedColumnOffsets({
    scrollElement,
    pinnedGroups,
    visibleColumnIds,
    columnSizing: state.columnSizing,
    density: state.density,
    scrollWidth: scrollMetrics.width,
    enableRowSelection,
  })
  const {
    focus,
    setFocus,
    cellRange,
    setCellRange,
    beginCellRange,
    extendCellRange,
    refocusActiveCell,
    restoreGridFocusRef,
  } = useGridSelectionFocus({ scrollElement, rowCount, rowHeight, virtualizeThreshold: virtualizeRowThreshold })
  const columnWindow = useMemo<ColumnVirtualWindow | undefined>(() => {
    if (centerLeafColumns.length <= 12) return undefined
    const widths = centerLeafColumns.map((column) => state.columnSizing[column.id] ?? column.getSize())
    const range = computeColumnRange({
      widths,
      scrollOffset: scrollMetrics.left,
      viewport: scrollMetrics.width,
      overscan: 2,
    })
    const windowed = centerLeafColumns.slice(range.start, range.end)
    const paddingLeft = widths.slice(0, range.start).reduce((sum, width) => sum + width, 0)
    const paddingRight = widths.slice(range.end).reduce((sum, width) => sum + width, 0)
    return {
      ids: windowed.map((column) => column.id),
      paddingLeft,
      paddingRight,
    }
  }, [centerLeafColumns, scrollMetrics.left, scrollMetrics.width, state.columnSizing])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const projectedView = useMemo(() => projectView(state), [state])
  const projectedViewKey = useMemo(() => JSON.stringify(projectedView), [projectedView])
  const currentSavedView = useMemo(() => {
    if (!savedViewsEnabled) return undefined
    return savedViewItems.find((item) => JSON.stringify(item.view) === projectedViewKey)
  }, [projectedViewKey, savedViewItems, savedViewsEnabled])
  const selectedRows = useMemo(
    () => rows.filter((row) => state.rowSelection[getRowId(row)]),
    [getRowId, rows, state.rowSelection],
  )
  const selectedRowIds = useMemo(() => selectedRows.map(getRowId), [getRowId, selectedRows])
  const visibleRowIds = useMemo(() => visibleData.map(getRowId), [getRowId, visibleData])
  const saveCurrentView = useCallback(
    (name: string) => createSavedView(name, projectedView),
    [createSavedView, projectedView],
  )
  const applySavedViewById = useCallback(
    (id: string) => applySavedView(id, view.applyView),
    [applySavedView, view.applyView],
  )
  const resetCurrentView = useCallback(
    () => resetSavedView(view.applyView),
    [resetSavedView, view.applyView],
  )
  const clearSelection = useCallback(
    () => {
      dispatch({ type: 'CLEAR_SELECTION' })
      onClearAllMatching?.()
    },
    [dispatch, onClearAllMatching],
  )
  const contextSnapshot = useMemo<DataGridContextSnapshot<TData>>(() => ({
    totalRowCount: footerTotalRows,
    visibleRowCount: visibleData.length,
    selectedRowCount: matchingSelectionActive ? footerTotalRows : selectedRows.length,
    loadedSelectedRowCount: selectedRows.length,
    allMatchingRowsSelected: matchingSelectionActive,
    visibleRows: visibleData,
    selectedRows,
    globalFilter: state.globalFilter,
    columnFilters: state.columnFilters,
    sorting: state.sorting,
    savedViews: savedViewsEnabled ? savedViewItems.map((item) => ({ id: item.id, name: item.name })) : [],
    currentSavedView: currentSavedView ? { id: currentSavedView.id, name: currentSavedView.name } : undefined,
    actions: {
      saveCurrentView,
      applySavedView: applySavedViewById,
      resetView: resetCurrentView,
      clearSelection,
    },
  }), [
    applySavedViewById,
    clearSelection,
    currentSavedView,
    footerTotalRows,
    matchingSelectionActive,
    resetCurrentView,
    saveCurrentView,
    savedViewItems,
    savedViewsEnabled,
    selectedRows,
    state.columnFilters,
    state.globalFilter,
    state.sorting,
    visibleData,
  ])
  const contextReportKey = useMemo(() => JSON.stringify({
    totalRowCount: footerTotalRows,
    visibleRowIds,
    selectedRowIds,
    matchingSelectionActive,
    globalFilter: state.globalFilter,
    columnFilters: state.columnFilters,
    sorting: state.sorting,
    savedViews: savedViewItems.map((item) => ({ id: item.id, name: item.name })),
    currentSavedView: currentSavedView ? { id: currentSavedView.id, name: currentSavedView.name } : undefined,
    projectedViewKey,
  }), [
    currentSavedView,
    footerTotalRows,
    matchingSelectionActive,
    projectedViewKey,
    savedViewItems,
    selectedRowIds,
    state.columnFilters,
    state.globalFilter,
    state.sorting,
    visibleRowIds,
  ])
  const lastContextReportKeyRef = useRef('')

  useEffect(() => {
    if (contextReportKey === lastContextReportKeyRef.current) return
    lastContextReportKeyRef.current = contextReportKey
    onContextChange?.(contextSnapshot)
  }, [contextReportKey, contextSnapshot, onContextChange])

  const { dragPreview, onDragStart, onDragOver, onDragMove, onDragEnd, onDragCancel } = useColumnDragPreview({
    orderedMovableIds: visibleMovableColumnIds,
    columnWidths: columnWidthMap,
    dispatch,
  })

  const autofitColumn = useCallback(
    (columnId: string) => {
      if (!scrollElement) return
      const column = columns.find((item) => item.id === columnId)
      if (column && isActionRenderColumn(column)) return
      const widths = measureColumnContentWidths(scrollElement, columnId)
      if (widths.length === 0) return
      const width = fitColumnWidth(widths, { min: column?.minWidth, max: column?.maxWidth })
      dispatch({ type: 'RESIZE_COLUMN', id: columnId, width })
    },
    [dispatch, scrollElement, columns],
  )

  const columnsById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns])

  const { editingApi, markDirtyCells } = useInlineEditing({
    rows,
    columns,
    columnsById,
    getRowId,
    editMode,
    editingEnabled,
    onRowUpdate,
    visibleColumnIds,
    setFocus,
    refocusActiveCell,
  })

  const renderAggregatedCell = useCallback(
    (columnId: string, leafRows: unknown[]) => {
      const column = columnsById.get(columnId)
      if (!column?.aggregate) return null
      const value = resolveAggregate(column, leafRows as TData[])
      if (column.aggregatedCell) return column.aggregatedCell({ value })
      const formatted = isNumericColumnType(column.type)
        ? formatDataGridNumber(value, column.type, column.numberFormat, state.numberFormats[column.id])
        : formatAggregate(value, column.type)
      return <span className="num text-muted">{formatted}</span>
    },
    [columnsById, state.numberFormats],
  )

  const hasAggregates = useMemo(() => columns.some((column) => column.aggregate !== undefined), [columns])
  const footerAggregates = useMemo(
    () => (hasAggregates ? computeAggregates(columns, exportData, state.numberFormats) : {}),
    [hasAggregates, columns, exportData, state.numberFormats],
  )

  const {
    rootRef,
    copyCell,
    copyRow,
    copySelection,
    fillSelection,
    exportCsv,
    exportXlsx,
    exportAllCsv,
    exportAllXlsx,
  } = useGridClipboard({
    rows,
    columns,
    columnsById,
    getRowId,
    visibleData,
    visibleColumnIds,
    visibleRows,
    exportData,
    exportFilename,
    cellRange,
    focus,
    visibleSelectedCount,
    columnOrder: state.columnOrder,
    columnVisibility: state.columnVisibility,
    numberFormats: state.numberFormats,
    rowSelection: state.rowSelection,
    editingEnabled,
    onRowUpdate,
    markDirtyCells,
    allMatchingQuery,
    onExportAllCsv,
    onExportAllXlsx,
  })

  // Identity-constant handlers handed to the memoized render tree. Keeping these stable (alongside
  // the memoized derivations above) is what lets a selection toggle / data edit re-render only the
  // affected Row/Cell instead of the whole body.
  const handleToggleRow = useCallback((id: string) => dispatch({ type: 'TOGGLE_ROW', id }), [dispatch])
  const handleCellContextMenu = useCallback(
    (rowId: string, colId: string, x: number, y: number) => setMenu({ rowId, colId, x, y }),
    [],
  )
  const handleFocusCell = useCallback((row: number, col: number) => setFocus({ row, col }), [setFocus])

  // The single runtime value shared by every memoized row/cell. Its members are all stabilized
  // (memoized derivations + identity-constant handlers), so this object only changes when something
  // grid-wide actually changes — drag, edit session, pinned offsets, column window. A render driven
  // purely by per-row state (selection toggle, one row's data) leaves it untouched, which is exactly
  // what lets the memoized children skip.
  const gridRuntime = useMemo<GridRuntime>(() => ({
    enableRowSelection: Boolean(enableRowSelection),
    visibleColumnIds,
    treeColumnId,
    dragPreview,
    editing: editingApi,
    pinnedOffsets: pinnedColumnOffsets,
    columnWindow,
    onToggleRow: handleToggleRow,
    onCellContextMenu: handleCellContextMenu,
    onCopyCell: copyCell,
    onFillSelection: editingEnabled ? fillSelection : undefined,
    onFocusCell: handleFocusCell,
    onRangeStart: beginCellRange,
    onRangeEnter: extendCellRange,
    renderAggregatedCell: groupingActive ? renderAggregatedCell : undefined,
  }), [
    enableRowSelection,
    visibleColumnIds,
    treeColumnId,
    dragPreview,
    editingApi,
    pinnedColumnOffsets,
    columnWindow,
    handleToggleRow,
    handleCellContextMenu,
    copyCell,
    editingEnabled,
    fillSelection,
    handleFocusCell,
    beginCellRange,
    extendCellRange,
    groupingActive,
    renderAggregatedCell,
  ])

  const onGridKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>) => {
    const target = event.target
    const interactiveTarget =
      target instanceof HTMLButtonElement ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLElement && target.closest('[role="separator"]') !== null)
    if (interactiveTarget) return

    const intent = keyToIntent({
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
    })
    // Type-to-edit: a printable character opens the focused editable cell's editor, seeded with it.
    // (Space is 'toggle-select', Enter 'primary-action', F2 'edit' — so they never reach here.)
    if (
      intent === 'none'
      && focus.row >= 0
      && event.key.length === 1
      && !event.ctrlKey && !event.metaKey && !event.altKey
      && editingApi
    ) {
      const colId = visibleColumnIds[focus.col]
      const targetRow = visibleRows[focus.row]
      if (targetRow && !targetRow.getIsGrouped() && colId && editingApi.isEditable(colId)) {
        event.preventDefault()
        editingApi.start(targetRow.id, colId, event.key)
        return
      }
    }
    if (intent === 'none') return
    if (intent === 'close-menu') {
      setMenu(null)
      return
    }
    // Alt+Down on a focused header opens its column menu (the header controls aren't tab stops).
    if (intent === 'open-menu' && focus.row < 0) {
      event.preventDefault()
      const th = scrollElement?.querySelector<HTMLElement>(`th[data-col-index="${focus.col}"]`)
      th?.querySelector<HTMLButtonElement>('[data-grid-colmenu]')?.click()
      return
    }
    const dims = {
      rowCount,
      colCount: visibleLeafColumns.length,
      pageRows: Math.max(1, Math.floor((scrollElement?.clientHeight ?? 400) / rowHeight)),
    }
    if (intent === 'move') {
      const focusedRow = focus.row >= 0 ? visibleRows[focus.row] : undefined
      // ArrowRight expands a collapsed expandable row, ArrowLeft collapses an expanded one — from ANY
      // column. When the row's state already matches, it falls through to ordinary focus movement.
      if (
        focusedRow &&
        !focusedRow.getIsGrouped() &&
        focusedRow.getCanExpand() &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
      ) {
        const shouldExpand = event.key === 'ArrowRight'
        if (focusedRow.getIsExpanded() !== shouldExpand) {
          event.preventDefault()
          focusedRow.toggleExpanded(shouldExpand)
          return
        }
      }
      event.preventDefault()
      restoreGridFocusRef.current = true
      const next = moveFocus(focus, event.key, dims, { ctrl: event.ctrlKey || event.metaKey })
      if (event.shiftKey && focus.row >= 0 && next.row >= 0) {
        setCellRange((current) => ({
          anchor: current?.anchor ?? focus,
          focus: next,
        }))
      } else {
        setCellRange(null)
      }
      setFocus(next)
      return
    }
    if (focus.row < 0) {
      const column = visibleLeafColumns[focus.col]
      if (!column) return
      if (intent === 'primary-action') {
        event.preventDefault()
        if (column.getCanSort()) dispatch({ type: 'TOGGLE_SORT', columnId: column.id, multi: event.shiftKey })
      }
      if (intent === 'reorder-prev' || intent === 'reorder-next') {
        event.preventDefault()
        const delta = intent === 'reorder-next' ? 1 : -1
        const over = visibleLeafColumns[focus.col + delta]
        if (over) {
          restoreGridFocusRef.current = true
          dispatch({ type: 'REORDER_COLUMN', activeId: column.id, overId: over.id })
          setFocus((current) => ({ ...current, col: Math.max(0, Math.min(visibleLeafColumns.length - 1, current.col + delta)) }))
        }
      }
      if (intent === 'resize-grow' || intent === 'resize-shrink') {
        event.preventDefault()
        if (column.columnDef.meta?.resizable === false || column.columnDef.meta?.actions === true) return
        const delta = intent === 'resize-grow' ? 16 : -16
        dispatch({ type: 'RESIZE_COLUMN', id: column.id, width: column.getSize() + delta })
      }
      return
    }
    const row = visibleRows[focus.row]
    if (!row) return
    if (row.getIsGrouped()) {
      if (intent === 'primary-action') {
        event.preventDefault()
        row.toggleExpanded()
      }
      return
    }
    if (intent === 'toggle-select' && enableRowSelection) {
      event.preventDefault()
      dispatch({ type: 'TOGGLE_ROW', id: row.id })
      return
    }
    if (intent === 'edit') {
      event.preventDefault()
      const colId = visibleColumnIds[focus.col]
      if (editingApi && colId && editingApi.isEditable(colId)) editingApi.start(row.id, colId)
      return
    }
    if (intent === 'primary-action') {
      event.preventDefault()
      const colId = visibleColumnIds[focus.col]
      if (editingApi && colId && editingApi.isEditable(colId)) {
        editingApi.start(row.id, colId)
        return
      }
      const rowEl = scrollElement?.querySelector<HTMLElement>(`[data-row-id="${row.id}"]`)
      rowEl?.querySelector<HTMLButtonElement>('button:not([data-grid-copy])')?.click()
    }
  }

  return (
    <div
      ref={rootRef}
      className={`ledger-density-anim rounded-lg border border-line bg-surface shadow-card ${densityClass(state.density)}`}
      data-pinned-left={pinnedGroups.left.length}
      data-pinned-center={pinnedGroups.center.length}
      data-pinned-right={pinnedGroups.right.length}
    >
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="grid-announcer">
        {announcer.message}
      </div>
      <DataGridToolbar
        columns={columns}
        columnVisibility={state.columnVisibility}
        columnPinning={state.columnPinning}
        columnFilters={state.columnFilters}
        globalFilter={state.globalFilter}
        enableQuickFilter={enableQuickFilter}
        quickFilterPlaceholder={quickFilterPlaceholder}
        density={state.density}
        grouping={state.grouping}
        enableGrouping={groupingActive}
        dispatch={dispatch}
        enableExport={enableExport}
        enableHeaderFilters={enableHeaderFilters}
        headerFiltersOpen={headerFiltersOpen}
        onToggleHeaderFilters={() => setHeaderFiltersOpen((value) => !value)}
        onExportCsv={exportCsv}
        onExportXlsx={enableExcelExport ? exportXlsx : undefined}
        onExportAllCsv={isServerMode && onExportAllCsv ? exportAllCsv : undefined}
        onExportAllXlsx={isServerMode && onExportAllXlsx ? exportAllXlsx : undefined}
        savedViews={savedViewsEnabled ? savedViewItems.map((item) => ({ id: item.id, name: item.name })) : undefined}
        onSaveView={saveCurrentView}
        onApplyView={applySavedViewById}
        onDeleteView={removeSavedView}
        onResetView={resetCurrentView}
      />
      {enableRowSelection && selectionDisplayCount > 0 && (
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <DataGridBulkActions
            count={selectionDisplayCount}
            totalMatchingCount={canSelectAllMatching || matchingSelectionActive ? footerTotalRows : undefined}
            allMatchingRowsSelected={matchingSelectionActive}
            onSelectAllMatching={canSelectAllMatching ? () => onSelectAllMatching?.(allMatchingQuery) : undefined}
            onClear={clearSelection}
          />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className={`relative ${loading || error !== undefined || rowCount === 0 ? 'min-h-[220px]' : ''}`}>
          <div ref={setScrollElement} className="ledger-scroll-thin max-h-[640px] overflow-auto" data-testid="datagrid-scroll">
            <table
              className="w-full border-collapse"
              role="grid"
              aria-multiselectable={enableRowSelection ? true : undefined}
              // +1 row for the column-header row (aria-rowindex 1); +1 column for the selection column.
              aria-rowcount={(manualPagination ? (totalRowCount ?? rowCount) : filteredRows.length) + 1}
              aria-colcount={visibleLeafColumns.length + (enableRowSelection ? 1 : 0)}
              onKeyDown={onGridKeyDown}
            >
              <GridRuntimeProvider value={gridRuntime}>
                <DataGridHeader
                  table={table}
                  dispatch={dispatch}
                  columnSizing={state.columnSizing}
                  columns={columns}
                  columnPinning={state.columnPinning}
                  columnFilters={state.columnFilters}
                  enableHeaderFilters={Boolean(enableHeaderFilters && headerFiltersOpen)}
                  enableRowSelection={enableRowSelection}
                  isServerMode={isServerMode}
                  selectAll={allState}
                  onSelectAll={(select) => dispatch({ type: 'SELECT_ALL_VISIBLE', ids: visibleIds, select })}
                  dndProvider={false}
                  dragPreview={dragPreview}
                  focus={focus}
                  columnWindow={columnWindow}
                  visibleColumnIds={visibleColumnIds}
                  onFocusCell={handleFocusCell}
                  onAutofitColumn={autofitColumn}
                  pinnedOffsets={pinnedColumnOffsets}
                  enableGrouping={groupingActive}
                  grouping={state.grouping}
                  numberFormats={state.numberFormats}
                />
                {/* Existing rows stay mounted during a refetch (dimmed under the overlay). The
                    skeleton only stands in for the initial load, so the tbody never collapses. */}
                {error === undefined && rowCount > 0 && (
                  <DataGridBody
                    table={table}
                    rowSelection={state.rowSelection}
                    rowHeight={rowHeight}
                    scrollElement={scrollElement}
                    enableVirtualization={rowCount > virtualizeRowThreshold && !detailPanelActive}
                    focus={focus}
                    range={cellRange}
                    renderDetailPanel={detailPanelActive ? renderDetailPanel : undefined}
                    // Absolute aria-rowindex base: the page offset so a screen reader announces the true
                    // position across pages; 0 when unpaginated (virtualization windows the full set).
                    ariaRowIndexOffset={paginationEnabled ? state.pagination.pageIndex * state.pagination.pageSize : 0}
                  />
                )}
                {error === undefined && loading && rowCount === 0 && (
                  <DataGridSkeletonRows columnCount={visibleLeafColumns.length} enableRowSelection={enableRowSelection} />
                )}
                {hasAggregates && !loading && error === undefined && rowCount > 0 && (
                  <DataGridAggregationFooter
                    table={table}
                    aggregates={footerAggregates}
                    rowCount={footerTotalRows}
                    enableRowSelection={enableRowSelection}
                    columnWindow={columnWindow}
                    pinnedOffsets={pinnedColumnOffsets}
                  />
                )}
              </GridRuntimeProvider>
            </table>
          </div>
          {/* Status overlay centered over a dimmed grid. The backdrop is pointer-transparent so the
              header stays usable during a refetch; only the message card captures pointer events. */}
          {(loading || error !== undefined || rowCount === 0) && (
            <div
              data-testid="datagrid-overlay"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-surface/70"
            >
              <div className="pointer-events-auto">
                {loading ? (
                  <DataGridLoadingState />
                ) : error !== undefined ? (
                  <DataGridErrorState error={error} />
                ) : (
                  <DataGridEmptyState query={state.globalFilter || undefined} />
                )}
              </div>
            </div>
          )}
        </div>
        <DragOverlay dropAnimation={null}>
          <DataGridColumnDragOverlay
            table={table}
            columnId={dragPreview?.activeId ?? null}
            width={dragPreview ? columnWidthMap[dragPreview.activeId] : undefined}
          />
        </DragOverlay>
      </DndContext>
      {paginationEnabled && (
        <DataGridFooter
          pageIndex={state.pagination.pageIndex}
          pageSize={state.pagination.pageSize}
          pageCount={footerPageCount}
          totalRowCount={footerTotalRows}
          onPageIndexChange={(pageIndex) => dispatch({ type: 'SET_PAGE_INDEX', pageIndex })}
          onPageSizeChange={(pageSize) => dispatch({ type: 'SET_PAGE_SIZE', pageSize })}
        />
      )}
      {menu && (
        <DataGridContextMenu
          x={menu.x}
          y={menu.y}
          selectionCount={visibleSelectedCount}
          rowPinSide={
            state.rowPinning.top.includes(menu.rowId)
              ? 'top'
              : state.rowPinning.bottom.includes(menu.rowId)
                ? 'bottom'
                : false
          }
          onCopyCell={() => copyCell(menu.rowId, menu.colId)}
          onCopyRow={() => copyRow(menu.rowId)}
          onCopySelection={copySelection}
          onPinRowTop={() => dispatch({ type: 'PIN_ROW_TOP', rowId: menu.rowId })}
          onPinRowBottom={() => dispatch({ type: 'PIN_ROW_BOTTOM', rowId: menu.rowId })}
          onUnpinRow={() => dispatch({ type: 'UNPIN_ROW', rowId: menu.rowId })}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  )
}
