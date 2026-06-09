import { type Row } from '@tanstack/react-table'
import { DataGridCell } from './DataGridCell'
import { DataGridRowCheckbox } from './DataGridSelectionCell'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridFocus } from './keyboard'
import type { ColumnVirtualWindow } from './types'

interface Props<TData> {
  row: Row<TData>
  enableRowSelection?: boolean
  selected?: boolean
  pinned?: 'top' | 'bottom'
  rowLabel?: string
  onToggleRow?: (id: string) => void
  onCellContextMenu?: (rowId: string, colId: string, clientX: number, clientY: number) => void
  dragPreview?: ColumnDragPreviewState | null
  rowIndex?: number
  focus?: GridFocus
  columnWindow?: ColumnVirtualWindow
  visibleColumnIds?: string[]
  onFocusCell?: (row: number, col: number) => void
}

export function DataGridRow<TData>({
  row,
  enableRowSelection,
  selected = false,
  pinned,
  rowLabel = row.id,
  onToggleRow,
  onCellContextMenu,
  dragPreview,
  rowIndex = row.index,
  focus,
  columnWindow,
  visibleColumnIds = row.getVisibleCells().map((cell) => cell.column.id),
  onFocusCell,
}: Props<TData>) {
  const toggle = () => onToggleRow?.(row.id)
  const visibleColIndex = (columnId: string) => visibleColumnIds.indexOf(columnId)
  const renderCell = (cell: ReturnType<Row<TData>['getVisibleCells']>[number], pinnedSide?: 'left' | 'right') => {
    const colIndex = visibleColIndex(cell.column.id)
    return (
      <DataGridCell
        key={cell.id}
        cell={cell}
        dragPreview={dragPreview}
        rowIndex={rowIndex}
        colIndex={colIndex}
        focused={focus?.row === rowIndex && focus.col === colIndex}
        pinnedSide={pinnedSide}
        onFocusCell={onFocusCell}
        onContextMenu={
          onCellContextMenu
            ? (event) => {
                event.preventDefault()
                onCellContextMenu(row.id, cell.column.id, event.clientX, event.clientY)
              }
            : undefined
        }
      />
    )
  }
  const centerIds = new Set(columnWindow?.ids)
  const leftCells = row.getLeftVisibleCells()
  const centerCells = row.getCenterVisibleCells()
  const rightCells = row.getRightVisibleCells()
  const windowedCenterCells = columnWindow
    ? centerCells.filter((cell) => centerIds.has(cell.column.id))
    : centerCells
  return (
    <tr
      role="row"
      className={`group border-t border-line hover:bg-surface-2 ${pinned ? 'bg-surface shadow-pinned' : ''}`}
      data-testid={`grid-row-${row.id}`}
      data-row-id={row.id}
      data-row-pinned={pinned}
      style={{ height: 'var(--row-h)' }}
      tabIndex={enableRowSelection ? 0 : undefined}
      aria-selected={enableRowSelection ? selected : undefined}
      onClick={enableRowSelection ? toggle : undefined}
      onKeyDown={
        enableRowSelection
          ? (event) => {
              if (event.key !== ' ' && event.key !== 'Spacebar') return
              event.preventDefault()
              event.stopPropagation()
              toggle()
            }
          : undefined
      }
    >
      {enableRowSelection && (
        <td className="w-10 px-2 text-center">
          <DataGridRowCheckbox rowId={row.id} rowLabel={rowLabel} checked={selected} onToggle={(id) => onToggleRow?.(id)} />
        </td>
      )}
      {leftCells.map((cell) => renderCell(cell, 'left'))}
      {columnWindow && columnWindow.paddingLeft > 0 && (
        <td aria-hidden="true" data-column-spacer="left" style={{ minWidth: columnWindow.paddingLeft, width: columnWindow.paddingLeft, padding: 0 }} />
      )}
      {windowedCenterCells.map((cell) => renderCell(cell))}
      {columnWindow && columnWindow.paddingRight > 0 && (
        <td aria-hidden="true" data-column-spacer="right" style={{ minWidth: columnWindow.paddingRight, width: columnWindow.paddingRight, padding: 0 }} />
      )}
      {rightCells.map((cell) => renderCell(cell, 'right'))}
    </tr>
  )
}
