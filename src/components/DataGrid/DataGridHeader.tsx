import './columnMeta'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender, type ColumnFiltersState, type Header, type Table } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isLockPositionColumn, lockedColumnIds } from './normalize'
import type { PinnedOffsets } from './selectors'
import { DataGridColumnMenu } from './DataGridColumnMenu'
import { DataGridResizeHandle } from './DataGridResizeHandle'
import { DataGridSelectAllCheckbox } from './DataGridSelectionCell'
import { VALUELESS_OPERATORS, type FilterValue } from './filtering'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridFocus } from './keyboard'
import type { ColumnPinning, ColumnVirtualWindow, DataGridNumberFormat, GridAction, DataGridColumn } from './types'

const noopDispatch = () => {}
const dragPreviewTransition = 'transform 160ms ease'
/** Header free-text/number/date filters dispatch after the user pauses, not on every keystroke. */
const FILTER_DEBOUNCE_MS = 200
const normalizeFilterDraft = (raw: string | number) => (raw === '' || raw === undefined ? '' : String(raw))

/**
 * A floating-filter text/number/date input whose value updates instantly for responsiveness but
 * whose dispatch is debounced — typing no longer re-filters + re-renders the grid on every
 * keystroke. The local draft is the source of truth while typing; it re-syncs only when the
 * committed value changes from the outside (a reset or an applied saved view), never echoing back
 * the grid's own in-flight edits.
 */
function FloatingFilterInput({
  columnId,
  label,
  inputType,
  value,
  operator,
  onCommit,
}: {
  columnId: string
  label: string
  inputType: 'text' | 'number' | 'date'
  value: string | number
  operator: FilterValue['operator']
  onCommit: (columnId: string, operator: FilterValue['operator'], value: unknown) => void
}) {
  const [draft, setDraft] = useState(() => normalizeFilterDraft(value))
  const committedRef = useRef(normalizeFilterDraft(value))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPending = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const commit = (raw: string) => {
    cancelPending()
    committedRef.current = raw
    onCommit(columnId, operator, raw)
  }

  // Re-sync the draft to an externally-changed committed value (reset / applied view), but skip when
  // it matches what we just dispatched so the input never fights the user's cursor while typing. An
  // external change wins over an in-flight debounced edit, so cancel any pending commit first —
  // otherwise a late timer would clobber the reset/applied value with the half-typed string.
  useEffect(() => {
    const next = normalizeFilterDraft(value)
    if (next !== committedRef.current) {
      cancelPending()
      committedRef.current = next
      setDraft(next)
    }
  }, [value])

  useEffect(() => () => cancelPending(), [])

  return (
    <input
      className="h-7 w-full rounded-[2px] border border-line bg-surface px-2 text-[12px] text-ink placeholder:text-faint"
      aria-label={`Filter ${label}`}
      type={inputType}
      value={draft}
      onChange={(event) => {
        const raw = event.target.value
        setDraft(raw)
        cancelPending()
        timerRef.current = setTimeout(() => {
          timerRef.current = null
          commit(raw)
        }, FILTER_DEBOUNCE_MS)
      }}
      // Commit immediately on blur (tabbing away / closing the filter panel) so a value typed
      // within the debounce window is never lost when the input unmounts.
      onBlur={() => {
        if (timerRef.current) commit(draft)
      }}
    />
  )
}

const VALUELESS_FILTER_LABELS: Record<string, string> = {
  blank: 'Is blank',
  notBlank: 'Is not blank',
  isEmpty: 'Is empty',
}

/** Compact read-only summary of a multi-value / valueless filter for the floating-filter chip. */
function summarizeFilter(current: FilterValue): string {
  const { operator, value } = current
  if (VALUELESS_OPERATORS.has(operator)) return VALUELESS_FILTER_LABELS[operator] ?? operator
  if (operator === 'between' && Array.isArray(value)) {
    const cell = (part: unknown) => (part === '' || part === null || part === undefined ? '…' : String(part))
    return `${cell(value[0])} – ${cell(value[1])}`
  }
  if (operator === 'isAnyOf' && Array.isArray(value)) {
    return value.length === 1 ? String(value[0]) : `${value.length} selected`
  }
  return String(value ?? '')
}

function headerLabel<TData>(header: Header<TData, unknown>, column?: DataGridColumn<TData>) {
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
  dropIndicatorSide,
  onFocusCell,
  onAutofitColumn,
  enableGrouping,
  grouping = [],
  numberFormats = {},
}: {
  header: Header<TData, unknown>
  dispatch?: (action: GridAction) => void
  columnSizing: Record<string, number>
  columns: DataGridColumn<TData>[]
  columnPinning: ColumnPinning
  columnFilters: ColumnFiltersState
  dragPreview?: ColumnDragPreviewState | null
  colIndex?: number
  focused?: boolean
  pinnedSide?: 'left' | 'right'
  pinnedOffset?: number
  /** Which edge of this header shows the column-reorder insertion bar, if any. */
  dropIndicatorSide?: 'left' | 'right'
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
  const source = columns.find((column) => column.id === header.column.id)
  const canMove = source ? !isLockPositionColumn(source) : header.column.id !== 'actions'
  const isActions = header.column.columnDef.meta?.actions === true
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
              getFacetedValues={() => header.column.getFacetedUniqueValues()}
            />
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <span
          className={`flex min-w-0 items-center gap-1 text-[13px] font-semibold text-ink ${align === 'right' ? 'justify-self-end justify-end text-right' : 'justify-self-start text-left'}`}
          data-testid={`col-header-label-${header.column.id}`}
        >
          <span className="min-w-0 truncate" data-autofit-label>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </span>
          {canSort && (
            <span className="flex shrink-0 items-center gap-0.5">
              {sorted === 'asc' ? (
                <ArrowUp aria-hidden="true" className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
              ) : sorted === 'desc' ? (
                <ArrowDown aria-hidden="true" className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
              ) : (
                // Faint affordance that the column is sortable; revealed on header hover/focus.
                <ChevronsUpDown
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  strokeWidth={2}
                />
              )}
              {sorted && multiSortActive && (
                <span
                  data-testid="sort-priority"
                  className="flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-accent-soft px-1 text-[9px] font-semibold tabular-nums text-accent"
                >
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
      {dropIndicatorSide && (
        // Insertion bar marking where the dragged column will land.
        <span
          aria-hidden="true"
          data-testid="reorder-drop-indicator"
          className={`pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-accent ${dropIndicatorSide === 'left' ? 'left-0' : 'right-0'}`}
        />
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
  columns?: DataGridColumn<TData>[]
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
  const lockedIds = new Set(lockedColumnIds(columns))
  const visibleMovable = table.getVisibleLeafColumns().map((column) => column.id).filter((id) => !lockedIds.has(id))
  const leafIds = visibleColumnIds ?? table.getVisibleLeafColumns().map((column) => column.id)
  const colIndexFor = (columnId: string) => leafIds.indexOf(columnId)
  // Where the dragged column will land: a bar on the trailing edge of the hovered column when
  // dragging rightward, the leading edge when dragging leftward. Read off the live drag preview.
  const dropTarget = (() => {
    if (!dragPreview || dragPreview.activeId === dragPreview.overId) return null
    const activeIdx = leafIds.indexOf(dragPreview.activeId)
    const overIdx = leafIds.indexOf(dragPreview.overId)
    if (activeIdx < 0 || overIdx < 0) return null
    return { columnId: dragPreview.overId, side: (activeIdx < overIdx ? 'right' : 'left') as 'left' | 'right' }
  })()
  const dropIndicatorFor = (columnId: string) => (dropTarget?.columnId === columnId ? dropTarget.side : undefined)
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
                      dropIndicatorSide={dropIndicatorFor(header.column.id)}
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
                      dropIndicatorSide={dropIndicatorFor(header.column.id)}
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
                      dropIndicatorSide={dropIndicatorFor(header.column.id)}
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
                if (column.columnDef.meta?.actions === true || !filterType) {
                  return (
                    <th
                      key={column.id}
                      className="border-r border-line px-3 py-2"
                      data-column-id={column.id}
                      style={previewStyle}
                    />
                  )
                }
                // Reflect — and preserve — whatever the column menu set. A multi-value or valueless
                // filter (between / isAnyOf / blank / notBlank) can't be edited inline without
                // clobbering it, so show a read-only summary chip with a clear button. Single-value
                // operators stay editable and keep their operator instead of resetting to the default.
                const op = current?.operator
                const isComplexFilter = op !== undefined && (op === 'between' || op === 'isAnyOf' || VALUELESS_OPERATORS.has(op) || Array.isArray(currentValue))
                if (isComplexFilter && current) {
                  const summary = summarizeFilter(current)
                  return (
                    <th key={column.id} className="border-r border-line px-3 py-2" data-column-id={column.id} style={previewStyle}>
                      <div
                        className="flex h-7 items-center justify-between gap-1 rounded-[2px] border border-line bg-surface-2 px-2 text-[12px] text-muted"
                        title="Edit this filter from the column menu"
                        aria-label={`${label} filter: ${summary}`}
                      >
                        <span className="truncate">{summary}</span>
                        <button
                          type="button"
                          aria-label={`Clear ${label} filter`}
                          className="shrink-0 text-muted hover:text-ink"
                          onClick={() => (dispatch ?? noopDispatch)({ type: 'CLEAR_COLUMN_FILTER', columnId: column.id })}
                        >
                          <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
                        </button>
                      </div>
                    </th>
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
                    <FloatingFilterInput
                      columnId={column.id}
                      label={label}
                      inputType={filterType === 'number' || filterType === 'currency' || filterType === 'percent' ? 'number' : filterType === 'date' ? 'date' : 'text'}
                      value={typeof currentValue === 'string' || typeof currentValue === 'number' ? currentValue : ''}
                      operator={op ?? (filterType === 'text' ? 'contains' : 'equals')}
                      onCommit={setColumnFilter}
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
