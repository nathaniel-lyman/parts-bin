import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'
import type { CSSProperties, MouseEvent } from 'react'
import type { ColumnDragPreviewState } from './dragPreview'

function CopyGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
      <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
    </svg>
  )
}

export function DataGridCell<TData>({
  cell,
  onContextMenu,
  onCopy,
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
  onCopy?: () => void
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
  const showCopy = onCopy !== undefined && !isActions
  return (
    <td
      role="gridcell"
      className={`group/cell relative hover:bg-accent-soft ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${pinnedSide ? 'bg-surface shadow-pinned' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
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
      {showCopy && (
        <button
          type="button"
          aria-label="Copy cell value"
          data-grid-copy=""
          // tabIndex -1 on purpose: focusable copy icons in every cell would break the grid's
          // roving tabindex; the reveal rides on the td's own roving focus via group-focus-within.
          tabIndex={-1}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-[2px] border border-line bg-surface p-0.5 text-muted opacity-0 pointer-events-none transition-opacity hover:text-ink group-hover/cell:opacity-100 group-hover/cell:pointer-events-auto group-focus-within/cell:opacity-100 group-focus-within/cell:pointer-events-auto"
          onClick={(event) => {
            event.stopPropagation()
            onCopy()
          }}
        >
          <CopyGlyph />
        </button>
      )}
    </td>
  )
}
