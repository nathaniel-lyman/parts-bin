import './columnMeta'
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender, type ColumnFiltersState, type Header, type Table } from '@tanstack/react-table'
import { type CSSProperties } from 'react'
import { isLockedColumn, isMovableColumnId } from './normalize'
import { DataGridColumnMenu } from './DataGridColumnMenu'
import { DataGridResizeHandle } from './DataGridResizeHandle'
import { DataGridSelectAllCheckbox } from './DataGridSelectionCell'
import type { FilterValue } from './filtering'
import type { ColumnPinning, GridAction, LedgerGridColumn } from './types'

const noopDispatch = () => {}

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
}: {
  header: Header<TData, unknown>
  dispatch?: (action: GridAction) => void
  columnSizing: Record<string, number>
  columns: LedgerGridColumn<TData>[]
  columnPinning: ColumnPinning
  columnFilters: ColumnFiltersState
}) {
  const sorted = header.column.getIsSorted()
  const align = header.column.columnDef.meta?.align ?? 'left'
  const canSort = header.column.getCanSort()
  const canMove = isMovableColumnId(header.column.id)
  const source = columns.find((column) => column.id === header.column.id)
  const canResize = header.column.columnDef.meta?.resizable !== false && canMove
  const label = headerLabel(header, source)
  const currentFilter = columnFilters.find((filter) => filter.id === header.column.id)?.value as FilterValue | undefined
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id, disabled: !canMove })
  const style: CSSProperties = {
    transform: canMove ? CSS.Translate.toString(transform) : undefined,
    transition: canMove ? transition : undefined,
    opacity: isDragging ? 0.72 : undefined,
    position: 'relative',
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      data-testid={`col-header-${header.column.id}`}
      aria-sort={canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
      onClick={
        canSort
          ? dispatch
            ? (event) => dispatch({ type: 'TOGGLE_SORT', columnId: header.column.id, multi: event.shiftKey })
            : header.column.getToggleSortingHandler()
          : undefined
      }
      className={`micro select-none px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${canSort ? 'cursor-pointer' : ''}`}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {canMove && (
          <button
            type="button"
            className="num inline-flex h-5 w-5 cursor-grab items-center justify-center rounded-[2px] text-[11px] text-faint hover:bg-surface hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
            aria-label={`Move ${label} column`}
            {...attributes}
            {...listeners}
            onClick={(event) => event.stopPropagation()}
          >
            <span aria-hidden="true">::</span>
          </button>
        )}
        <span>
          {flexRender(header.column.columnDef.header, header.getContext())}
          {sorted && <span className="text-accent"> {sorted === 'asc' ? '▲' : '▼'}</span>}
        </span>
        <DataGridColumnMenu
          columnId={header.column.id}
          header={label}
          type={source?.type ?? 'text'}
          filterMeta={header.column.columnDef.meta}
          currentFilter={currentFilter}
          sortDirection={sorted}
          hideable={(source?.hideable ?? true) && header.column.id !== 'actions'}
          canPin={(source?.pinnable ?? true) && header.column.id !== 'actions'}
          pinSide={pinSide(header.column.id, columnPinning)}
          dispatch={dispatch ?? noopDispatch}
        />
      </div>
      {canResize && (
        <DataGridResizeHandle
          columnId={header.column.id}
          header={label}
          currentWidth={columnSizing[header.column.id] ?? header.column.getSize()}
          onResize={(id, width) => (dispatch ?? noopDispatch)({ type: 'RESIZE_COLUMN', id, width })}
          onReset={(id) => (dispatch ?? noopDispatch)({ type: 'RESET_COLUMN_WIDTH', id })}
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
  columnPinning = { left: [], right: ['actions'] },
  columnFilters = [],
  enableHeaderFilters = false,
  enableRowSelection = false,
  isServerMode = false,
  selectAll = 'none',
  onSelectAll,
  dndProvider = true,
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
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const visibleMovable = table.getVisibleLeafColumns().map((column) => column.id).filter(isMovableColumnId)
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
                <th className="w-10 px-2">
                  <DataGridSelectAllCheckbox
                    state={selectAll}
                    label={isServerMode ? 'Select all loaded' : 'Select all'}
                    onChange={(select) => onSelectAll?.(select)}
                  />
                </th>
              )}
              {headerGroup.headers.map((header) => (
                <SortableHeader
                  key={header.id}
                  header={header}
                  dispatch={dispatch}
                  columnSizing={columnSizing}
                  columns={columns}
                  columnPinning={columnPinning}
                  columnFilters={columnFilters}
                />
              ))}
            </tr>
          ))}
          {enableHeaderFilters && (
            <tr className="border-t border-line bg-surface" onClick={(event) => event.stopPropagation()}>
              {enableRowSelection && <th className="px-2" />}
              {table.getVisibleLeafColumns().map((column) => {
                const source = columns.find((item) => item.id === column.id)
                const label = typeof source?.header === 'string' && source.header ? source.header : column.id
                const meta = column.columnDef.meta
                const filterType = meta?.type
                const current = columnFilters.find((filter) => filter.id === column.id)?.value as FilterValue | undefined
                const currentValue = current?.value
                if (isLockedColumn(column.id) || !filterType) return <th key={column.id} className="px-3 py-2" />
                if (filterType === 'enum' || filterType === 'status') {
                  return (
                    <th key={column.id} className="px-3 py-2">
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
                  <th key={column.id} className="px-3 py-2">
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
