import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'
import type { CSSProperties, MouseEvent } from 'react'
import type { ColumnDragPreviewState } from './dragPreview'

export function DataGridCell<TData>({
  cell,
  onContextMenu,
  dragPreview,
  rowIndex,
  colIndex,
  focused,
  pinnedSide,
  pinnedOffset = 0,
  onFocusCell,
}: {
  cell: Cell<TData, unknown>
  onContextMenu?: (event: MouseEvent<HTMLTableCellElement>) => void
  dragPreview?: ColumnDragPreviewState | null
  rowIndex?: number
  colIndex?: number
  focused?: boolean
  pinnedSide?: 'left' | 'right'
  pinnedOffset?: number
  onFocusCell?: (row: number, col: number) => void
}) {
  const align = cell.column.columnDef.meta?.align
  const isActions = cell.column.id === 'actions'
  const previewOffset = dragPreview?.offsets[cell.column.id] ?? 0
  const isPreviewActive = dragPreview?.activeId === cell.column.id
  const style: CSSProperties = {
    minWidth: cell.column.getSize(),
    width: cell.column.getSize(),
    padding: isActions ? '0.25rem 0.5rem' : 'var(--cell-pad)',
    boxSizing: isActions ? 'border-box' : undefined,
    transform: isPreviewActive || previewOffset === 0 ? undefined : `translateX(${previewOffset}px)`,
    transition: dragPreview ? 'transform 160ms ease' : undefined,
    opacity: isPreviewActive ? 0.28 : undefined,
    ...(pinnedSide === 'left' ? { position: 'sticky', left: pinnedOffset, zIndex: 10 } : {}),
    ...(pinnedSide === 'right' ? { position: 'sticky', right: pinnedOffset, zIndex: 10 } : {}),
  }
  return (
    <td
      role="gridcell"
      className={`${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${pinnedSide ? 'bg-surface shadow-pinned' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      data-column-id={cell.column.id}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      style={style}
      tabIndex={focused ? 0 : -1}
      onContextMenu={onContextMenu}
      onFocus={() => {
        if (rowIndex !== undefined && colIndex !== undefined) onFocusCell?.(rowIndex, colIndex)
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}
