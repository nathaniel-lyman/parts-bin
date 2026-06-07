import './columnMeta'
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender, type Header, type Table } from '@tanstack/react-table'
import { type CSSProperties } from 'react'
import { isMovableColumnId } from './normalize'
import { DataGridColumnMenu } from './DataGridColumnMenu'
import { DataGridResizeHandle } from './DataGridResizeHandle'
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
}: {
  header: Header<TData, unknown>
  dispatch: (action: GridAction) => void
  columnSizing: Record<string, number>
  columns: LedgerGridColumn<TData>[]
  columnPinning: ColumnPinning
}) {
  const sorted = header.column.getIsSorted()
  const align = header.column.columnDef.meta?.align ?? 'left'
  const canSort = header.column.getCanSort()
  const canMove = isMovableColumnId(header.column.id)
  const source = columns.find((column) => column.id === header.column.id)
  const canResize = header.column.columnDef.meta?.resizable !== false && canMove
  const label = headerLabel(header, source)
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
      aria-sort={canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
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
          sortDirection={sorted}
          hideable={(source?.hideable ?? true) && header.column.id !== 'actions'}
          canPin={(source?.pinnable ?? true) && header.column.id !== 'actions'}
          pinSide={pinSide(header.column.id, columnPinning)}
          dispatch={dispatch}
        />
      </div>
      {canResize && (
        <DataGridResizeHandle
          columnId={header.column.id}
          header={label}
          currentWidth={columnSizing[header.column.id] ?? header.column.getSize()}
          onResize={(id, width) => dispatch({ type: 'RESIZE_COLUMN', id, width })}
          onReset={(id) => dispatch({ type: 'RESET_COLUMN_WIDTH', id })}
        />
      )}
    </th>
  )
}

export function DataGridHeader<TData>({
  table,
  dispatch = noopDispatch,
  columnSizing = {},
  columns = [],
  columnPinning = { left: [], right: ['actions'] },
}: {
  table: Table<TData>
  dispatch?: (action: GridAction) => void
  columnSizing?: Record<string, number>
  columns?: LedgerGridColumn<TData>[]
  columnPinning?: ColumnPinning
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
    dispatch({ type: 'REORDER_COLUMN', activeId: String(active.id), overId: String(over.id) })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={visibleMovable} strategy={horizontalListSortingStrategy}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-surface-2">
              {headerGroup.headers.map((header) => (
                <SortableHeader
                  key={header.id}
                  header={header}
                  dispatch={dispatch}
                  columnSizing={columnSizing}
                  columns={columns}
                  columnPinning={columnPinning}
                />
              ))}
            </tr>
          ))}
        </thead>
      </SortableContext>
    </DndContext>
  )
}
