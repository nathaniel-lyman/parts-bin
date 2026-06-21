import './columnMeta'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender, type ColumnFiltersState, type Header, type Table } from '@tanstack/react-table'
import { type CSSProperties } from 'react'
import { isLockedColumn, isMovableColumnId } from './normalize'
import type { PinnedOffsets } from './selectors'
import { DataGridColumnMenu } from './DataGridColumnMenu'
import { DataGridResizeHandle } from './DataGridResizeHandle'
import { DataGridSelectAllCheckbox } from './DataGridSelectionCell'
import type { FilterValue } from './filtering'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridFocus } from './keyboard'
import type { ColumnPinning, ColumnVirtualWindow, DataGridNumberFormat, GridAction, LedgerGridColumn } from './types'

const noopDispatch = () => {}
const dragPreviewTransition = 'transform 160ms ease'

function headerLabel<TData>(header: Header<TData, unknown>, column?: LedgerGridColumn<TData>) {
  if (typeof column?.header === 'string' && column.header) return column.header
  if (typeof header.column.columnDef.header === 'string' && header.column.columnDef.header) return header.column.columnDef.header
  return header.column.id
}

function pinSide(columnId: string, pinning: ColumnPinning): 'left' | 'right' | false {
  if (pinning.left.includes(columnId)) return 'left'
  if (pinning.right.includes(columnId)) return 'right'
  return false
}

function SortableHeader<TData>({
  header,
  dispatch,
  columnSizing,
  columns,
  columnPinning,
  columnFilters,
  dragPreview,
  colIndex,
  focused,
  pinnedSide,
  pinnedOffset = 0,
  onFocusCell,
  onAutofitColumn,
  enableGrouping,
  grouping = [],
  numberFormats = {},
}: {
  header: Header<TData, unknown>
  dispatch?: (action: GridAction) => void
  columnSizing: Record<string, number>
  columns: LedgerGridColumn<TData>[]
  columnPinning: ColumnPinning
  columnFilters: ColumnFiltersState
  dragPreview?: ColumnDragPreviewState | null
  colIndex?: number
  focused?: boolean
  pinnedSide?: 'left' | 'right'
  pinnedOffset?: number
  onFocusCell?: (row: number, col: number) => void
  onAutofitColumn?: (columnId: string) => void
  enableGrouping?: boolean
  grouping?: string[]
  numberFormats?: Record<string, DataGridNumberFormat>
}) {
  const sorted = header.column.getIsSorted()
  const multiSortActive = header.getContext().table.getState().sorting.length > 1
  const align = header.column.columnDef.meta?.align ?? 'left'
  const canSort = header.column.getCanSort()
  const canMove = isMovableColumnId(header.column.id)
  const isActions = header.column.id === 'actions'
  const source = columns.find((column) => column.id === header.column.id)
  const canResize = header.column.columnDef.meta?.resizable !== false && canMove
  const label = headerLabel(header, source)
  const currentFilter = columnFilters.find((filter) => filter.id === header.column.id)?.value as FilterValue | undefined
  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id, disabled: !canMove })
  const previewOffset = dragPreview?.offsets[header.column.id] ?? 0
  const isPreviewActive = dragPreview?.activeId === header.column.id
  const previewTransform = previewOffset !== 0 ? `translateX(${previewOffset}px)` : undefined
  const sortableTransform = canMove && !dragPreview ? CSS.Translate.toString(transform) : undefined
  const style: CSSProperties = {
    minWidth: header.column.getSize(),
    width: header.column.getSize(),
    transform: isPreviewActive ? undefined : (previewTransform ?? sortableTransform),
    transition: dragPreview ? dragPreviewTransition : canMove ? transition : undefined,
    opacity: isPreviewActive ? 0.28 : isDragging ? 0.72 : undefined,
    position: pinnedSide ? 'sticky' : 'relative',
    ...(pinnedSide === 'left' ? { left: pinnedOffset } : {}),
    ...(pinnedSide === 'right' ? { right: pinnedOffset } : {}),
    zIndex: pinnedSide ? 30 : isDragging && !dragPreview ? 1 : undefined,
    boxSizing: isActions ? 'border-box' : undefined,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      data-testid={`col-header-${header.column.id}`}
      data-column-id={header.column.id}
      data-col-id={header.column.id}
      data-col-index={colIndex}
      data-col-width={header.column.getSize()}
      aria-sort={canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
      tabIndex={focused ? 0 : -1}
      onClick={
        canSort
          ? dispatch
            ? (event) => dispatch({ type: 'TOGGLE_SORT', columnId: header.column.id, multi: event.shiftKey })
            : header.column.getToggleSortingHandler()
          : undefined
      }
      onFocus={() => {
        if (colIndex !== undefined) onFocusCell?.(-1, colIndex)
      }}
      className={`group border-r border-line py-2 ${isActions ? 'px-2' : 'px-3'} ${align === 'right' ? 'text-right' : 'text-left'} ${canSort || canMove ? 'cursor-pointer' : ''} ${pinnedSide ? 'bg-surface-2 shadow-pinned' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      {...(canMove ? listeners : {})}
    >
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
        {!isActions ? (
          <span className="justify-self-start" data-testid={`col-header-controls-${header.column.id}`}>
            <DataGridColumnMenu
              columnId={header.column.id}
              header={label}
              type={source?.type ?? 'text'}
              filterMeta={header.column.columnDef.meta}
              currentFilter={currentFilter}
              columnNumberFormat={source?.numberFormat}
              currentNumberFormat={numberFormats[header.column.id]}
              sortDirection={sorted}
              hideable={source?.hideable ?? true}
              canPin={source?.pinnable ?? true}
              pinSide={pinSide(header.column.id, columnPinning)}
              canGroup={Boolean(enableGrouping && source?.groupable)}
              isGrouped={grouping.includes(header.column.id)}
              dispatch={dispatch ?? noopDispatch}
              onAutofit={onAutofitColumn}
            />
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <span
          className={`min-w-0 truncate text-[13px] font-semibold text-ink ${align === 'right' ? 'justify-self-end text-right' : 'justify-self-start text-left'}`}
          data-autofit-label
          data-testid={`col-header-label-${header.column.id}`}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {sorted && (
            <span className="text-accent">
              {' '}{sorted === 'asc' ? '▲' : '▼'}
              {multiSortActive && (
                <span data-testid="sort-priority" className="ml-0.5 align-super text-[9px] tabular-nums">
                  {header.column.getSortIndex() + 1}
                </span>
              )}
            </span>
          )}
        </span>
      </div>
      {canResize && (
        <span className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <DataGridResizeHandle
            columnId={header.column.id}
            header={label}
            currentWidth={columnSizing[header.column.id] ?? header.column.getSize()}
            onResize={(id, width) => (dispatch ?? noopDispatch)({ type: 'RESIZE_COLUMN', id, width })}
            onAutofit={(id) => onAutofitColumn?.(id)}
          />
        </span>
      )}
    </th>
  )
}

export function DataGridHeader<TData>({
  table,
  dispatch,
  columnSizing = {},
  columns = [],
  columnPinning = { left: [], right: [] },
  columnFilters = [],
  enableHeaderFilters = false,
  enableRowSelection = false,
  isServerMode = false,
  selectAll = 'none',
  onSelectAll,
  dndProvider = true,
  dragPreview,
  focus,
  columnWindow,
  visibleColumnIds,
  onFocusCell,
  onAutofitColumn,
  pinnedOffsets,
  enableGrouping = false,
  grouping = [],
  numberFormats = {},
}: {
  table: Table<TData>
  dispatch?: (action: GridAction) => void
  columnSizing?: Record<string, number>
  columns?: LedgerGridColumn<TData>[]
  columnPinning?: ColumnPinning
  columnFilters?: ColumnFiltersState
  enableHeaderFilters?: boolean
  enableRowSelection?: boolean
  isServerMode?: boolean
  selectAll?: 'none' | 'some' | 'all'
  onSelectAll?: (select: boolean) => void
  dndProvider?: boolean
  dragPreview?: ColumnDragPreviewState | null
  focus?: GridFocus
  columnWindow?: ColumnVirtualWindow
  visibleColumnIds?: string[]
  onFocusCell?: (row: number, col: number) => void
  onAutofitColumn?: (columnId: string) => void
  pinnedOffsets?: PinnedOffsets
  enableGrouping?: boolean
  grouping?: string[]
  numberFormats?: Record<string, DataGridNumberFormat>
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const visibleMovable = table.getVisibleLeafColumns().map((column) => column.id).filter(isMovableColumnId)
  const leafIds = visibleColumnIds ?? table.getVisibleLeafColumns().map((column) => column.id)
  const colIndexFor = (columnId: string) => leafIds.indexOf(columnId)
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    ;(dispatch ?? noopDispatch)({ type: 'REORDER_COLUMN', activeId: String(active.id), overId: String(over.id) })
  }
  const setColumnFilter = (columnId: string, operator: FilterValue['operator'], value: unknown) => {
    if (value === '' || value === null || value === undefined) (dispatch ?? noopDispatch)({ type: 'CLEAR_COLUMN_FILTER', columnId })
    else (dispatch ?? noopDispatch)({ type: 'SET_COLUMN_FILTER', columnId, value: { operator, value } })
  }

  const content = (
    <SortableContext items={visibleMovable} strategy={horizontalListSortingStrategy}>
      <thead className="sticky top-0 z-20 bg-surface-2">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-surface-2" data-testid="grid-header-row">
              {enableRowSelection && (
                <th className="sticky left-0 z-30 w-10 border-r border-line bg-surface-2 px-2 shadow-pinned">
                  <DataGridSelectAllCheckbox
                    state={selectAll}
                    label={isServerMode ? 'Select all loaded' : 'Select all'}
                    onChange={(select) => onSelectAll?.(select)}
                  />
                </th>
              )}
              {headerGroup.headers
                .filter((header) => header.column.getIsPinned() === 'left')
                .map((header) => {
                  const colIndex = colIndexFor(header.column.id)
                  return (
                    <SortableHeader
                      key={header.id}
                      header={header}
                      dispatch={dispatch}
                      columnSizing={columnSizing}
                      columns={columns}
                      columnPinning={columnPinning}
                      columnFilters={columnFilters}
                      dragPreview={dragPreview}
                      colIndex={colIndex}
                      focused={focus?.row === -1 && focus.col === colIndex}
                      pinnedSide="left"
                      pinnedOffset={pinnedOffsets?.left[header.column.id] ?? 0}
                      onFocusCell={onFocusCell}
                      onAutofitColumn={onAutofitColumn}
                      enableGrouping={enableGrouping}
                      grouping={grouping}
                      numberFormats={numberFormats}
                    />
                  )
                })}
              {columnWindow && columnWindow.paddingLeft > 0 && (
                <th aria-hidden="true" data-column-spacer="left" style={{ minWidth: columnWindow.paddingLeft, width: columnWindow.paddingLeft, padding: 0 }} />
              )}
              {headerGroup.headers
                .filter((header) => {
                  if (header.column.getIsPinned()) return false
                  return !columnWindow || columnWindow.ids.includes(header.column.id)
                })
                .map((header) => {
                  const colIndex = colIndexFor(header.column.id)
                  return (
                    <SortableHeader
                      key={header.id}
                      header={header}
                      dispatch={dispatch}
                      columnSizing={columnSizing}
                      columns={columns}
                      columnPinning={columnPinning}
                      columnFilters={columnFilters}
                      dragPreview={dragPreview}
                      colIndex={colIndex}
                      focused={focus?.row === -1 && focus.col === colIndex}
                      onFocusCell={onFocusCell}
                      onAutofitColumn={onAutofitColumn}
                      enableGrouping={enableGrouping}
                      grouping={grouping}
                      numberFormats={numberFormats}
                    />
                  )
                })}
              {columnWindow && columnWindow.paddingRight > 0 && (
                <th aria-hidden="true" data-column-spacer="right" style={{ minWidth: columnWindow.paddingRight, width: columnWindow.paddingRight, padding: 0 }} />
              )}
              {headerGroup.headers
                .filter((header) => header.column.getIsPinned() === 'right')
                .map((header) => {
                  const colIndex = colIndexFor(header.column.id)
                  return (
                    <SortableHeader
                      key={header.id}
                      header={header}
                      dispatch={dispatch}
                      columnSizing={columnSizing}
                      columns={columns}
                      columnPinning={columnPinning}
                      columnFilters={columnFilters}
                      dragPreview={dragPreview}
                      colIndex={colIndex}
                      focused={focus?.row === -1 && focus.col === colIndex}
                      pinnedSide="right"
                      pinnedOffset={pinnedOffsets?.right[header.column.id] ?? 0}
                      onFocusCell={onFocusCell}
                      onAutofitColumn={onAutofitColumn}
                      enableGrouping={enableGrouping}
                      grouping={grouping}
                      numberFormats={numberFormats}
                    />
                  )
                })}
            </tr>
          ))}
          {enableHeaderFilters && (
            <tr className="border-t border-line bg-surface" onClick={(event) => event.stopPropagation()}>
              {enableRowSelection && <th className="sticky left-0 z-30 border-r border-line bg-surface px-2 shadow-pinned" />}
              {table.getVisibleLeafColumns().map((column) => {
                const source = columns.find((item) => item.id === column.id)
                const label = typeof source?.header === 'string' && source.header ? source.header : column.id
                const meta = column.columnDef.meta
                const filterType = meta?.type
                const current = columnFilters.find((filter) => filter.id === column.id)?.value as FilterValue | undefined
                const currentValue = current?.value
                const previewOffset = dragPreview?.offsets[column.id] ?? 0
                const isPreviewActive = dragPreview?.activeId === column.id
                const previewStyle: CSSProperties = {
                  transform: isPreviewActive || previewOffset === 0 ? undefined : `translateX(${previewOffset}px)`,
                  transition: dragPreview ? dragPreviewTransition : undefined,
                  opacity: isPreviewActive ? 0.28 : undefined,
                }
                if (isLockedColumn(column.id) || !filterType) {
                  return (
                    <th
                      key={column.id}
                      className="border-r border-line px-3 py-2"
                      data-column-id={column.id}
                      style={previewStyle}
                    />
                  )
                }
                if (filterType === 'enum' || filterType === 'status') {
                  return (
                    <th key={column.id} className="border-r border-line px-3 py-2" data-column-id={column.id} style={previewStyle}>
                      <select
                        className="h-7 w-full rounded-[2px] border border-line bg-surface px-2 text-[12px] text-ink"
                        aria-label={`Filter ${label}`}
                        value={typeof currentValue === 'string' ? currentValue : ''}
                        onChange={(event) => setColumnFilter(column.id, 'is', event.target.value)}
                      >
                        <option value="">All</option>
                        {(meta.options ?? []).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </th>
                  )
                }
                return (
                  <th key={column.id} className="border-r border-line px-3 py-2" data-column-id={column.id} style={previewStyle}>
                    <input
                      className="h-7 w-full rounded-[2px] border border-line bg-surface px-2 text-[12px] text-ink placeholder:text-faint"
                      aria-label={`Filter ${label}`}
                      type={filterType === 'number' || filterType === 'currency' || filterType === 'percent' ? 'number' : filterType === 'date' ? 'date' : 'text'}
                      value={typeof currentValue === 'string' || typeof currentValue === 'number' ? currentValue : ''}
                      onChange={(event) => setColumnFilter(column.id, filterType === 'text' ? 'contains' : 'equals', event.target.value)}
                    />
                  </th>
                )
              })}
            </tr>
          )}
      </thead>
    </SortableContext>
  )

  if (!dndProvider) return content

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      {content}
    </DndContext>
  )
}
