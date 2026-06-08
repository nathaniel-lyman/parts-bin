import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'
import type { CSSProperties, MouseEvent } from 'react'
import type { ColumnDragPreviewState } from './dragPreview'

export function DataGridCell<TData>({
  cell,
  onContextMenu,
  dragPreview,
}: {
  cell: Cell<TData, unknown>
  onContextMenu?: (event: MouseEvent<HTMLTableCellElement>) => void
  dragPreview?: ColumnDragPreviewState | null
}) {
  const align = cell.column.columnDef.meta?.align
  const previewOffset = dragPreview?.offsets[cell.column.id] ?? 0
  const isPreviewActive = dragPreview?.activeId === cell.column.id
  const style: CSSProperties = {
    padding: 'var(--cell-pad)',
    transform: isPreviewActive || previewOffset === 0 ? undefined : `translateX(${previewOffset}px)`,
    transition: dragPreview ? 'transform 160ms ease' : undefined,
    opacity: isPreviewActive ? 0.28 : undefined,
  }
  return (
    <td
      role="gridcell"
      className={`${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      data-column-id={cell.column.id}
      style={style}
      onContextMenu={onContextMenu}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}
