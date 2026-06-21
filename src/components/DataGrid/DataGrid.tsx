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
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  getCoreRowModel,
  getExpandedRowModel,
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
import { ACTIONS_COLUMN_ID, canHideColumn, canSortColumn, isMovableColumnId } from './normalize'
import { gridReducer } from './reducers'
import { densityClass, pinnedLeafGroups, pinnedOffsets, rowHeightForDensity, selectAllState, selectionCount, type PinnedOffsets } from './selectors'
import { hydrate } from './state'
import { ledgerFilterFn } from './filtering'
import { serializeGridQuery, toGridQuery, type GridQuery } from './query'
import { copyToClipboard, downloadCSV, downloadXLSX, serializeCSV, serializeCell, serializeTSV, serializeXLSX } from './export'
import { projectView } from './persistence'
import { keyToIntent, moveFocus, resolveCopyIntent, type GridFocus } from './keyboard'
import { computeColumnRange } from './virtualization'
import { useToast } from '../ui'
import { DataGridBulkActions } from './DataGridBulkActions'
import { DataGridBody } from './DataGridBody'
import { DataGridColumnDragOverlay } from './DataGridColumnDragOverlay'
import { DataGridContextMenu } from './DataGridContextMenu'
import { DataGridEmptyState } from './DataGridEmptyState'
import { DataGridErrorState } from './DataGridErrorState'
import { DataGridFooter } from './DataGridFooter'
import { DataGridHeader } from './DataGridHeader'
import { DataGridLoadingState } from './DataGridLoadingState'
import { DataGridToolbar } from './DataGridToolbar'
import { projectColumnDrag, type ColumnDragPreviewState } from './dragPreview'
import { fitColumnWidth, measureColumnContentWidths } from './autofit'
import { computeAggregates, formatAggregate, resolveAggregate } from './aggregation'
import {
  commitSession,
  editorTypeFor,
  isColumnEditable,
  isDirtyCell,
  markDirty,
  parseDraft,
  setDraft,
  startEdit,
  type DirtyCells,
  type EditMode,
  type EditSession,
  type GridEditingApi,
} from './editing'
import { DataGridAggregationFooter } from './DataGridAggregationFooter'
import type { ColumnVirtualWindow, DataGridColumn, DataGridState, GridAction } from './types'
import {
  cellRangeBounds,
  isMultiCellRange,
  parseClipboardTable,
  serializeCellRange,
  type CellRange,
} from './rangeSelection'

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

function toColumnDef<TData>(column: DataGridColumn<TData>): ColumnDef<TData> {
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
    enableGrouping: column.groupable === true,
  }
  if (column.cell) {
    base.cell = (ctx) => column.cell!({ value: ctx.getValue(), row: ctx.row.original, rowId: ctx.row.id })
  }

  if (column.accessorFn) return { ...base, accessorFn: column.accessorFn }
  if (column.accessorKey) return { ...base, accessorKey: column.accessorKey as string }
  return base
}

const EMPTY_OFFSETS: PinnedOffsets = { left: {}, right: {} }

function sameSide(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((key) => a[key] === b[key])
}

function sameOffsets(a: PinnedOffsets, b: PinnedOffsets): boolean {
  return sameSide(a.left, b.left) && sameSide(a.right, b.right)
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
    quickFilterPlaceholder,
    enableGrouping,
    onRowUpdate,
    editMode = 'cell',
    getSubRows,
    getRowCanExpand,
    renderDetailPanel,
    treeColumnId,
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
  const [scrollMetrics, setScrollMetrics] = useState({ left: 0, width: 1024 })
  const [headerFiltersOpen, setHeaderFiltersOpen] = useState(false)
  const [dragPreview, setDragPreview] = useState<ColumnDragPreviewState | null>(null)
  const [focus, setFocus] = useState<GridFocus>({ row: 0, col: 0 })
  const [cellRange, setCellRange] = useState<CellRange | null>(null)
  const [selectingRange, setSelectingRange] = useState(false)
  const restoreGridFocusRef = useRef(false)
  const view = useGridViewState(seed, columns)
  const {
    views: savedViewItems,
    create: createSavedView,
    remove: removeSavedView,
    apply: applySavedView,
    reset: resetSavedView,
  } = useSavedViews(persistenceKey ? `${persistenceKey}.views` : undefined)
  const toast = useToast()
  const state = isControlled ? props.state! : view.state
  const paginationEnabled = enablePagination || manualPagination
  const savedViewsEnabled = !isControlled && (enableSavedViews || persistenceKey !== undefined)

  const dispatch = (action: GridAction) => {
    if (isControlled) props.onStateChange!(gridReducer(state, action, columns))
    else view.dispatch(action)
  }

  useGridPersistence(state, persistenceEnabled, persistenceKey)

  const columnDefs = useMemo(() => columns.map(toColumnDef), [columns])
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

  const effectiveColumnOrder = useMemo(
    () => {
      const ids = columns.map((column) => column.id)
      const ordered = state.columnOrder.filter((id) => ids.includes(id) && id !== ACTIONS_COLUMN_ID)
      for (const id of ids) {
        if (id !== ACTIONS_COLUMN_ID && !ordered.includes(id)) ordered.push(id)
      }
      return [...ordered, ACTIONS_COLUMN_ID].filter((id) => ids.includes(id))
    },
    [columns, state.columnOrder],
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
    ...(manualFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
    ...(groupingActive ? { getGroupedRowModel: getGroupedRowModel() } : {}),
    ...(expandedActive ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    ...(paginationEnabled && !manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const rowCount = table.getRowModel().rows.length
  const visibleRows = table.getRowModel().rows
  const visibleLeafColumns = table.getVisibleLeafColumns()
  const centerLeafColumns = table.getCenterVisibleLeafColumns()
  // Group rows have no `original`; selection/copy/context must only ever see leaf rows.
  const visibleLeafRows = visibleRows.filter((row) => !row.getIsGrouped())
  const visibleIds = visibleLeafRows.map((row) => row.id)
  const visibleData = visibleLeafRows.map((row) => row.original)
  const exportData = (manualFiltering ? table.getRowModel().rows : table.getFilteredRowModel().rows).map((row) => row.original)
  const footerTotalRows = manualPagination ? (totalRowCount ?? rowCount) : table.getFilteredRowModel().rows.length
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
  const visibleColumnIds = visibleLeafColumns.map((column) => column.id)
  const visibleMovableColumnIds = visibleColumnIds.filter(isMovableColumnId)
  const columnWidthMap = Object.fromEntries(visibleLeafColumns.map((column) => [column.id, state.columnSizing[column.id] ?? column.getSize()]))
  const pinnedGroups = pinnedLeafGroups(visibleColumnIds, state.columnPinning)
  const rowHeight = rowHeightForDensity(state.density)
  // Sticky offsets must come from RENDERED widths: the w-full table stretches columns past
  // their logical getSize(), and the selection column has no fixed width — so we measure.
  const [pinnedColumnOffsets, setPinnedColumnOffsets] = useState<PinnedOffsets>({ left: {}, right: {} })
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
    // dispatch is stable for our purposes; recreating per render is harmless here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClearAllMatching],
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

  const updateDragPreview = (activeId: string, overId: string) => {
    if (!isMovableColumnId(activeId)) {
      setDragPreview(null)
      return
    }
    const effectiveOverId = isMovableColumnId(overId) ? overId : activeId
    const projection = projectColumnDrag({
      orderedIds: visibleMovableColumnIds,
      widths: columnWidthMap,
      activeId,
      overId: effectiveOverId,
    })
    setDragPreview({ activeId, overId: effectiveOverId, ...projection })
  }

  const onDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id)
    updateDragPreview(activeId, activeId)
  }

  const onDragOver = (event: DragOverEvent) => {
    updateDragPreview(String(event.active.id), event.over ? String(event.over.id) : String(event.active.id))
  }

  const onDragMove = (event: DragMoveEvent) => {
    if (!dragPreview) updateDragPreview(String(event.active.id), String(event.active.id))
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDragPreview(null)
    if (over) dispatch({ type: 'REORDER_COLUMN', activeId: String(active.id), overId: String(over.id) })
  }

  const onDragCancel = () => setDragPreview(null)

  const autofitColumn = useCallback(
    (columnId: string) => {
      if (!scrollElement || columnId === 'actions') return
      const column = columns.find((item) => item.id === columnId)
      const widths = measureColumnContentWidths(scrollElement, columnId)
      if (widths.length === 0) return
      const width = fitColumnWidth(widths, { min: column?.minWidth, max: column?.maxWidth })
      dispatch({ type: 'RESIZE_COLUMN', id: columnId, width })
    },
    // dispatch is stable for our purposes; recreating per render is harmless here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollElement, columns],
  )

  const [editSession, setEditSession] = useState<EditSession | null>(null)
  const [dirtyCells, setDirtyCells] = useState<DirtyCells>({})
  const columnsById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns])

  const refocusActiveCell = useCallback(() => {
    restoreGridFocusRef.current = true
    setFocus((current) => ({ ...current }))
  }, [])

  const startEditing = useCallback(
    (rowId: string, columnId: string) => {
      const row = rows.find((item) => getRowId(item) === rowId)
      if (!row || !isColumnEditable(columnsById.get(columnId))) return
      setEditSession(startEdit(editMode, rowId, columnId, columns, row))
    },
    [columns, columnsById, editMode, getRowId, rows],
  )

  const cancelEditing = useCallback(() => {
    setEditSession(null)
    refocusActiveCell()
  }, [refocusActiveCell])

  const commitEditing = useCallback(
    (move?: 'next' | 'prev') => {
      if (!editSession) return
      const row = rows.find((item) => getRowId(item) === editSession.rowId)
      if (!row) {
        setEditSession(null)
        return
      }
      const result = commitSession(editSession, columns, row)
      if (!result.ok) {
        setEditSession({ ...editSession, errors: result.errors })
        return
      }
      if (Object.keys(result.patch).length > 0) {
        onRowUpdate?.(editSession.rowId, result.patch as Partial<TData>, row)
        setDirtyCells((current) => markDirty(current, editSession.rowId, result.changed))
      }
      if (move && editSession.mode === 'cell') {
        const step = move === 'next' ? 1 : -1
        const from = visibleColumnIds.indexOf(editSession.columnId)
        for (let index = from + step; index >= 0 && index < visibleColumnIds.length; index += step) {
          if (isColumnEditable(columnsById.get(visibleColumnIds[index]))) {
            setFocus((current) => ({ ...current, col: index }))
            setEditSession(startEdit('cell', editSession.rowId, visibleColumnIds[index], columns, row))
            return
          }
        }
      }
      setEditSession(null)
      refocusActiveCell()
    },
    [columns, columnsById, editSession, getRowId, onRowUpdate, refocusActiveCell, rows, visibleColumnIds],
  )

  const editingApi: GridEditingApi | undefined = editingEnabled
    ? {
        session: editSession,
        isEditable: (columnId) => isColumnEditable(columnsById.get(columnId)),
        isDirty: (rowId, columnId) => isDirtyCell(dirtyCells, rowId, columnId),
        editorFor: (columnId) => {
          const column = columnsById.get(columnId)
          return column
            ? { type: editorTypeFor(column), options: column.meta?.options }
            : { type: 'text' }
        },
        start: startEditing,
        setDraft: (columnId, value) => setEditSession((session) => (session ? setDraft(session, columnId, value) : session)),
        commit: commitEditing,
        cancel: cancelEditing,
      }
    : undefined

  const renderAggregatedCell = useCallback(
    (columnId: string, leafRows: TData[]) => {
      const column = columnsById.get(columnId)
      if (!column?.aggregate) return null
      const value = resolveAggregate(column, leafRows)
      if (column.aggregatedCell) return column.aggregatedCell({ value })
      return <span className="num text-muted">{formatAggregate(value, column.type)}</span>
    },
    [columnsById],
  )

  const hasAggregates = columns.some((column) => column.aggregate !== undefined)
  const footerAggregates = hasAggregates ? computeAggregates(columns, exportData) : {}

  const visibleSelectedCountRef = useRef(visibleSelectedCount)
  const focusTargetRef = useRef<{ rowId: string; colId: string } | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  visibleSelectedCountRef.current = visibleSelectedCount
  focusTargetRef.current = (() => {
    if (focus.row < 0) return null
    const row = visibleRows[focus.row]
    const colId = visibleColumnIds[focus.col]
    return row && colId ? { rowId: row.id, colId } : null
  })()

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

  // The clipboard-facing value: the column's `exportValue` formatter when present (so a copied
  // currency/percent cell lands in Excel as "$24,600" / "-2.1%"), else the raw value. Kept separate
  // from resolveCellValue, which paste compares against and must stay raw.
  const resolveCellExportValue = useCallback(
    (row: TData, columnId: string): unknown => {
      const raw = resolveCellValue(row, columnId)
      const column = columnsById.get(columnId)
      return column?.exportValue ? column.exportValue(raw, row) : raw
    },
    [columnsById, resolveCellValue],
  )

  // Header label for the copied column range. Falls back to the id for non-string headers.
  const columnHeaderLabel = useCallback(
    (columnId: string): string => {
      const column = columnsById.get(columnId)
      return column && typeof column.header === 'string' ? column.header : columnId
    },
    [columnsById],
  )

  const beginCellRange = useCallback((row: number, col: number) => {
    const next = { row, col }
    setFocus(next)
    setCellRange({ anchor: next, focus: next })
    setSelectingRange(true)
  }, [])

  const extendCellRange = useCallback((row: number, col: number) => {
    if (!selectingRange) return
    const next = { row, col }
    setCellRange((current) => current ? { ...current, focus: next } : { anchor: next, focus: next })
    setFocus(next)
  }, [selectingRange])

  useEffect(() => {
    if (!selectingRange) return
    const stopSelecting = () => setSelectingRange(false)
    window.addEventListener('mouseup', stopSelecting)
    return () => window.removeEventListener('mouseup', stopSelecting)
  }, [selectingRange])

  // Writes to the clipboard and toasts on success; the two-argument then scopes the
  // error-swallow to the clipboard write only (a throw from toast() would still surface).
  const copyWithFeedback = useCallback((text: string, message: string) => {
    void copyToClipboard(text).then(() => toast(message), () => {})
  }, [toast])

  const copyRange = useCallback(() => {
    if (!cellRange || !isMultiCellRange(cellRange)) return false
    const text = serializeCellRange(cellRange, visibleData, visibleColumnIds, resolveCellExportValue, {
      header: columnHeaderLabel,
    })
    if (!text) return false
    const bounds = cellRangeBounds(cellRange)
    const cells = (bounds.rowEnd - bounds.rowStart + 1) * (bounds.colEnd - bounds.colStart + 1)
    copyWithFeedback(text, cells === 1 ? 'Copied cell' : `Copied ${cells} cells`)
    return true
  }, [cellRange, columnHeaderLabel, copyWithFeedback, resolveCellExportValue, visibleColumnIds, visibleData])

  const copyCell = useCallback(
    (rowId: string, colId: string) => {
      const row = visibleData.find((item) => getRowId(item) === rowId) ?? rows.find((item) => getRowId(item) === rowId)
      if (!row) return
      copyWithFeedback(serializeCell(resolveCellExportValue(row, colId)), 'Copied cell')
    },
    [copyWithFeedback, getRowId, resolveCellExportValue, rows, visibleData],
  )

  const copyRow = useCallback(
    (rowId: string) => {
      const row = visibleData.find((item) => getRowId(item) === rowId) ?? rows.find((item) => getRowId(item) === rowId)
      if (!row) return
      copyWithFeedback(serializeTSV([row], columns, {
        getRowId,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
        includeHeader: false,
        formatted: true,
      }), 'Copied row')
    },
    [columns, copyWithFeedback, getRowId, rows, state.columnOrder, state.columnVisibility, visibleData],
  )

  const copySelection = useCallback(() => {
    // Count what serializeTSV actually emits: selected ∩ currently visible (hidden-but-selected
    // rows are not copied, so they must not be counted in the toast).
    const copiedCount = visibleData.filter((row) => state.rowSelection[getRowId(row)]).length
    // Every selected row is filtered out: skip the (header-only) write and the toast entirely.
    if (copiedCount === 0) return
    copyWithFeedback(serializeTSV(visibleData, columns, {
      getRowId,
      columnOrder: state.columnOrder,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
      formatted: true,
    }), copiedCount === 1 ? 'Copied 1 row' : `Copied ${copiedCount} rows`)
  }, [columns, copyWithFeedback, getRowId, state.columnOrder, state.columnVisibility, state.rowSelection, visibleData])

  const exportCsv = useCallback(() => {
    downloadCSV(exportFilename, serializeCSV(exportData, columns, {
      getRowId,
      columnOrder: state.columnOrder,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    }))
  }, [columns, exportData, exportFilename, getRowId, state.columnOrder, state.columnVisibility, state.rowSelection])

  const exportXlsx = useCallback(() => {
    const filename = exportFilename.replace(/\.csv$/i, '') || 'data-grid'
    downloadXLSX(`${filename}.xlsx`, serializeXLSX(exportData, columns, {
      getRowId,
      columnOrder: state.columnOrder,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    }))
  }, [columns, exportData, exportFilename, getRowId, state.columnOrder, state.columnVisibility, state.rowSelection])

  const exportAllCsv = useCallback(() => {
    onExportAllCsv?.(allMatchingQuery)
  }, [allMatchingQuery, onExportAllCsv])

  const exportAllXlsx = useCallback(() => {
    onExportAllXlsx?.(allMatchingQuery)
  }, [allMatchingQuery, onExportAllXlsx])

  const pasteTable = useCallback((text: string) => {
    if (!editingEnabled || !onRowUpdate) return false
    const incoming = parseClipboardTable(text)
    if (incoming.length === 0 || incoming[0]?.length === 0) return false

    const rangeBounds = cellRange ? cellRangeBounds(cellRange) : null
    const startRow = rangeBounds?.rowStart ?? focus.row
    const startCol = rangeBounds?.colStart ?? focus.col
    if (startRow < 0 || startCol < 0) return false

    const fillRange = Boolean(rangeBounds && isMultiCellRange(cellRange) && incoming.length === 1 && incoming[0]?.length === 1)
    const rowSpan = fillRange && rangeBounds ? rangeBounds.rowEnd - rangeBounds.rowStart + 1 : incoming.length
    const colSpan = fillRange && rangeBounds ? rangeBounds.colEnd - rangeBounds.colStart + 1 : Math.max(...incoming.map((row) => row.length))
    let changedCells = 0
    let attemptedEditableCells = 0

    for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
      const row = visibleData[startRow + rowOffset]
      if (!row) continue
      const rowId = getRowId(row)
      const patch: Record<string, unknown> = {}
      const changedColumnIds: string[] = []

      for (let colOffset = 0; colOffset < colSpan; colOffset += 1) {
        const columnId = visibleColumnIds[startCol + colOffset]
        const column = columnId ? columnsById.get(columnId) : undefined
        if (!column || !isColumnEditable(column)) continue
        attemptedEditableCells += 1

        const draft = fillRange ? incoming[0]?.[0] : incoming[rowOffset]?.[colOffset]
        if (draft === undefined) continue
        const parsed = parseDraft(editorTypeFor(column), draft)
        if (parsed.error) continue
        const validationMessage = column.validate?.(parsed.value as never, row)
        if (validationMessage) continue
        if (parsed.value === resolveCellValue(row, column.id)) continue
        patch[column.accessorKey as string] = parsed.value
        changedColumnIds.push(column.id)
      }

      if (changedColumnIds.length > 0) {
        onRowUpdate(rowId, patch as Partial<TData>, row)
        setDirtyCells((current) => markDirty(current, rowId, changedColumnIds))
        changedCells += changedColumnIds.length
      }
    }

    if (changedCells > 0) {
      toast(changedCells === 1 ? 'Pasted 1 cell' : `Pasted ${changedCells} cells`)
      return true
    }
    if (attemptedEditableCells > 0) {
      toast('Nothing pasted')
      return true
    }
    return false
  }, [
    cellRange,
    columnsById,
    editingEnabled,
    focus.col,
    focus.row,
    getRowId,
    onRowUpdate,
    toast,
    visibleColumnIds,
    visibleData,
  ])

  useEffect(() => {
    if (!scrollElement) return
    const update = () => setScrollMetrics({ left: scrollElement.scrollLeft, width: scrollElement.clientWidth })
    update()
    scrollElement.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      scrollElement.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [scrollElement])

  const pinnedKey = `${pinnedGroups.left.join(',')}|${pinnedGroups.right.join(',')}`
  const layoutKey = `${visibleColumnIds.join(',')}|${JSON.stringify(state.columnSizing)}|${state.density}|${scrollMetrics.width}|${enableRowSelection}`
  useLayoutEffect(() => {
    if (!scrollElement) {
      setPinnedColumnOffsets((prev) => (prev.left === EMPTY_OFFSETS.left ? prev : EMPTY_OFFSETS))
      return
    }
    const headerRow = scrollElement.querySelector('tr[data-testid="grid-header-row"]')
    if (!headerRow) return
    const widths: Record<string, number> = {}
    headerRow.querySelectorAll<HTMLElement>('th[data-column-id]').forEach((th) => {
      widths[th.dataset.columnId!] = th.getBoundingClientRect().width
    })
    const leadingTh = headerRow.querySelector<HTMLElement>('th:not([data-column-id])')
    const leadingOffset = enableRowSelection && leadingTh ? leadingTh.getBoundingClientRect().width : 0
    const next = pinnedOffsets({ left: pinnedGroups.left, right: pinnedGroups.right }, widths, leadingOffset)
    setPinnedColumnOffsets((prev) => (sameOffsets(prev, next) ? prev : next))
    // pinnedKey/layoutKey capture every layout input; pinnedGroups are derived from them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollElement, pinnedKey, layoutKey])

  const focusActiveCell = useCallback(() => {
    const root = scrollElement
    if (!root) return
    const selector = focus.row < 0
      ? `th[data-col-index="${focus.col}"]`
      : `td[data-row-index="${focus.row}"][data-col-index="${focus.col}"]`
    const el = root.querySelector<HTMLElement>(selector)
    if (!el) return
    el.focus()
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [focus.col, focus.row, scrollElement])

  useEffect(() => {
    if (!scrollElement) return
    if (!restoreGridFocusRef.current) return
    if (focus.row >= 0 && rowCount > 100) {
      scrollElement.scrollTop = Math.max(0, focus.row * rowHeight)
    }
    const restore = () => {
      focusActiveCell()
      restoreGridFocusRef.current = false
    }
    restore()
    const frame = requestAnimationFrame(restore)
    return () => cancelAnimationFrame(frame)
  }, [focus, focusActiveCell, rowCount, rowHeight, scrollElement])

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
    })
    if (intent === 'none') return
    if (intent === 'close-menu') {
      setMenu(null)
      return
    }
    const dims = {
      rowCount,
      colCount: visibleLeafColumns.length,
      pageRows: Math.max(1, Math.floor((scrollElement?.clientHeight ?? 400) / rowHeight)),
    }
    if (intent === 'move') {
      const focusedRow = focus.row >= 0 ? visibleRows[focus.row] : undefined
      const focusedColId = visibleColumnIds[focus.col]
      const activeTreeColumnId = treeColumnId ?? visibleColumnIds.find((id) => id !== ACTIONS_COLUMN_ID)
      if (
        focusedRow &&
        !focusedRow.getIsGrouped() &&
        focusedRow.getCanExpand() &&
        focusedColId === activeTreeColumnId &&
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
        if (column.columnDef.meta?.resizable === false || column.id === 'actions') return
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

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const active = document.activeElement
      const editableInput =
        active instanceof HTMLInputElement &&
        ['email', 'number', 'password', 'search', 'tel', 'text', 'url'].includes(active.type)
      const inEditableTarget =
        editableInput ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      const isCopyCombo = event.key.toLowerCase() === 'c' && (event.ctrlKey || event.metaKey)
      const isPasteCombo = event.key.toLowerCase() === 'v' && (event.ctrlKey || event.metaKey)
      if (!isCopyCombo && !isPasteCombo) return
      // Both clipboard intents are window-level, so scope them hard: focus must live inside this
      // grid, and a native text selection always wins over us (let the browser copy it).
      if (!rootRef.current || !active || !rootRef.current.contains(active)) return
      if (inEditableTarget) return
      if (window.getSelection()?.isCollapsed === false) return
      if (isPasteCombo) return
      if (copyRange()) return
      const intent = resolveCopyIntent(event, { hasSelection: visibleSelectedCountRef.current > 0, inEditableTarget })
      if (!intent) return
      if (intent === 'selection') {
        copySelection()
        return
      }
      if (!(active instanceof HTMLElement) || !active.closest('td[data-col-index]')) return
      const target = focusTargetRef.current
      if (target && target.colId !== 'actions') copyCell(target.rowId, target.colId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copyCell, copyRange, copySelection])

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const active = document.activeElement
      if (!rootRef.current || !active || !rootRef.current.contains(active)) return
      const inEditableTarget =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      if (inEditableTarget) return
      const text = event.clipboardData?.getData('text/plain') ?? ''
      if (!text) return
      if (!pasteTable(text)) return
      event.preventDefault()
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [pasteTable])

  return (
    <div
      ref={rootRef}
      className={`rounded-[2px] border border-line bg-surface ${densityClass(state.density)}`}
      data-pinned-left={pinnedGroups.left.length}
      data-pinned-center={pinnedGroups.center.length}
      data-pinned-right={pinnedGroups.right.length}
    >
      <DataGridToolbar
        columns={columns}
        columnVisibility={state.columnVisibility}
        globalFilter={state.globalFilter}
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
        <div ref={setScrollElement} className="max-h-[640px] overflow-auto" data-testid="datagrid-scroll">
          <table
            className="w-full border-collapse"
            role="grid"
            aria-rowcount={manualPagination ? (totalRowCount ?? rowCount) : table.getFilteredRowModel().rows.length}
            aria-colcount={visibleLeafColumns.length}
            onKeyDown={onGridKeyDown}
          >
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
              onFocusCell={(row, col) => setFocus({ row, col })}
              onAutofitColumn={autofitColumn}
              pinnedOffsets={pinnedColumnOffsets}
              enableGrouping={groupingActive}
              grouping={state.grouping}
            />
            {!loading && error === undefined && rowCount > 0 && (
              <DataGridBody
                table={table}
                enableRowSelection={enableRowSelection}
                rowSelection={state.rowSelection}
                rowHeight={rowHeight}
                scrollElement={scrollElement}
                enableVirtualization={rowCount > 100 && !detailPanelActive}
                onToggleRow={(id) => dispatch({ type: 'TOGGLE_ROW', id })}
                onCellContextMenu={(rowId, colId, x, y) => setMenu({ rowId, colId, x, y })}
                onCopyCell={copyCell}
                dragPreview={dragPreview}
                focus={focus}
                columnWindow={columnWindow}
                visibleColumnIds={visibleColumnIds}
                onFocusCell={(row, col) => setFocus({ row, col })}
                range={cellRange}
                onRangeStart={beginCellRange}
                onRangeEnter={extendCellRange}
                pinnedOffsets={pinnedColumnOffsets}
                editing={editingApi}
                renderAggregatedCell={groupingActive ? renderAggregatedCell : undefined}
                renderDetailPanel={detailPanelActive ? renderDetailPanel : undefined}
                treeColumnId={treeColumnId}
              />
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
          </table>
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
      {loading && <DataGridLoadingState />}
      {!loading && error !== undefined && <DataGridErrorState error={error} />}
      {!loading && error === undefined && rowCount === 0 && <DataGridEmptyState query={state.globalFilter || undefined} />}
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
