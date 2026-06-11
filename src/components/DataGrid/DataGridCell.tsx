import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import type { ColumnDragPreviewState } from './dragPreview'
import { isEditingCell, type GridEditingApi } from './editing'
import { DataGridCellEditor } from './DataGridCellEditor'

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
  editing,
  groupContent,
  aggregatedContent,
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
  editing?: GridEditingApi
  /** Rendered instead of the normal cell content for a grouped cell (chevron + value + count). */
  groupContent?: ReactNode
  /** Rendered instead of the normal cell content for an aggregated cell in a group row. */
  aggregatedContent?: ReactNode
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
  const isGroupCell = groupContent !== undefined || aggregatedContent !== undefined
  const editable = !isGroupCell && editing !== undefined && editing.isEditable(cell.column.id)
  const isEditing = editable && isEditingCell(editing.session, cell.row.id, cell.column.id, editing.isEditable)
  const isDirty = !isGroupCell && editing !== undefined && editing.isDirty(cell.row.id, cell.column.id)
  const showCopy = onCopy !== undefined && !isActions && !isEditing && !isGroupCell
  const editor = isEditing ? editing.editorFor(cell.column.id) : undefined
  return (
    <td
      role="gridcell"
      className={`group/cell relative hover:bg-accent-soft ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${pinnedSide ? 'bg-surface shadow-pinned' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      data-column-id={cell.column.id}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      data-cell-dirty={isDirty ? 'true' : undefined}
      style={style}
      tabIndex={focused ? 0 : -1}
      onContextMenu={onContextMenu}
      onDoubleClick={
        editable && !isEditing
          ? (event) => {
              event.stopPropagation()
              editing.start(cell.row.id, cell.column.id)
            }
          : undefined
      }
      onFocus={() => {
        if (rowIndex !== undefined && colIndex !== undefined) onFocusCell?.(rowIndex, colIndex)
      }}
    >
      {isEditing && editor ? (
        <DataGridCellEditor
          columnId={cell.column.id}
          editorType={editor.type}
          options={editor.options}
          value={editing.session?.drafts[cell.column.id] ?? ''}
          error={editing.session?.errors[cell.column.id]}
          align={align}
          onChange={(value) => editing.setDraft(cell.column.id, value)}
          onCommit={(move) => editing.commit(move)}
          onCancel={() => editing.cancel()}
        />
      ) : isGroupCell ? (
        groupContent ?? aggregatedContent
      ) : (
        flexRender(cell.column.columnDef.cell, cell.getContext())
      )}
      {isDirty && !isEditing && (
        <span
          aria-hidden="true"
          data-testid="dirty-marker"
          className="absolute right-0 top-0 border-l-8 border-t-8 border-l-transparent border-t-accent"
        />
      )}
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
