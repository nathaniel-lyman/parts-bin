import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable,
  type Header, type SortingState, type VisibilityState,
} from '@tanstack/react-table'
import type { Account } from '../../data/types'
import type { ColumnVisibility } from '../../hooks/useColumnVisibility'
import { isMovableColumnId, normalizeColumnOrder, useColumnOrder } from '../../hooks/useColumnOrder'
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

function SortableHeader({ header }: { header: Header<Account, unknown> }) {
  const sorted = header.column.getIsSorted()
  const align = header.column.columnDef.meta?.align
  const canSort = header.column.getCanSort()
  const canMove = isMovableColumnId(header.column.id)
  const label = typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id, disabled: !canMove })

  const style: CSSProperties | undefined = canMove ? {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.72 : undefined,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 1 : undefined,
  } : undefined

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
      </div>
    </th>
  )
}

export function DataTable({ accounts, visibility, onEdit, onDelete, onNew, onToggleColumn, onResetColumns }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'mrr', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const { columnOrder, setColumnOrder, reset: resetColumnOrder } = useColumnOrder()

  const columns = useMemo(() => buildColumns(onEdit, onDelete), [onEdit, onDelete])
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const resetLayout = useCallback(() => {
    onResetColumns?.()
    resetColumnOrder()
  }, [onResetColumns, resetColumnOrder])

  const handleColumnDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (!isMovableColumnId(activeId) || !isMovableColumnId(overId)) return

    setColumnOrder((current) => {
      const normalized = normalizeColumnOrder(current)
      const oldIndex = normalized.indexOf(activeId)
      const newIndex = normalized.indexOf(overId)
      if (oldIndex < 0 || newIndex < 0) return normalized
      return normalizeColumnOrder(arrayMove(normalized, oldIndex, newIndex))
    })
  }, [setColumnOrder])

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

  // TanStack Table is the chosen headless table engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    globalFilterFn: accountGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const visibleMovableColumnIds = table.getVisibleLeafColumns().map((column) => column.id).filter(isMovableColumnId)

  return (
    <div className="rounded-[2px] border border-line bg-surface">
      <Toolbar
        search={globalFilter}
        onSearch={setGlobalFilter}
        segments={segments}
        onToggleSegment={(s) => setSegments((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
        visibility={visibility}
        onToggleColumn={onToggleColumn}
        onResetColumns={resetLayout}
        onNew={onNew}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
        <SortableContext items={visibleMovableColumnIds} strategy={horizontalListSortingStrategy}>
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-surface-2">
                  {hg.headers.map((h) => <SortableHeader key={h.id} header={h} />)}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="group h-10 border-t border-line hover:bg-surface-2">
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
        </SortableContext>
      </DndContext>
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
