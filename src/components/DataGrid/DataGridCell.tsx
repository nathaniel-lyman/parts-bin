import './columnMeta'
import { flexRender, type Cell } from '@tanstack/react-table'
import { memo, useState, type CSSProperties, type ReactNode } from 'react'
import { isEditingCell } from './editing'
import { DataGridCellEditor } from './DataGridCellEditor'
import { useGridRuntime } from './GridRuntimeContext'

type FlashDir = 'up' | 'down' | 'neutral' | null

/** Direction of a value change: numeric deltas drive the pos/neg tint; anything else flashes neutral. */
function flashDirection(prev: unknown, next: unknown): Exclude<FlashDir, null> {
  const a = Number(prev)
  const b = Number(next)
  if (Number.isFinite(a) && Number.isFinite(b) && a !== b) return b > a ? 'up' : 'down'
  return 'neutral'
}

function CopyGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
      <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
    </svg>
  )
}

export interface DataGridCellProps<TData> {
  cell: Cell<TData, unknown>
  rowIndex?: number
  colIndex?: number
  focused?: boolean
  rangeSelected?: boolean
  /** True for the bottom-right cell of a multi-cell range — renders the fill handle. */
  rangeCorner?: boolean
  /** True when this cell's row is selected — only consulted for sticky/pinned cells, whose opaque
   *  background would otherwise hide the row's selection tint. Center cells inherit the <tr> tint. */
  selected?: boolean
  pinnedSide?: 'left' | 'right'
  pinnedOffset?: number
  /** Rendered instead of the normal cell content for a grouped cell (chevron + value + count). */
  groupContent?: ReactNode
  /** Rendered instead of the normal cell content for an aggregated cell in a group row. */
  aggregatedContent?: ReactNode
  /** Optional tree indentation / expander rendered before the normal cell content. */
  treePrefix?: ReactNode
}

function DataGridCellComponent<TData>({
  cell,
  rowIndex,
  colIndex,
  focused,
  rangeSelected,
  rangeCorner = false,
  selected = false,
  pinnedSide,
  pinnedOffset = 0,
  groupContent,
  aggregatedContent,
  treePrefix,
}: DataGridCellProps<TData>) {
  // Runtime-wide values come from context so this component can be memoized on its per-cell props.
  const { dragPreview, editing, onCopyCell, onFillSelection, onCellContextMenu, onFocusCell, onRangeStart, onRangeEnter } =
    useGridRuntime()
  // Cell-change flash. Detect a value change with React's sanctioned "derive state from a changed
  // value during render" pattern (a guarded setState in render — no effect, no extra browser paint,
  // and StrictMode-idempotent because the Object.is guard makes the next render a no-op). Because
  // the flash is held in STATE (not a ref read during render) it survives unrelated re-renders —
  // focus, range, pin, drag keep the same `seq`, so the keyed overlay is neither restarted nor cut
  // short — and onAnimationEnd clears it. This is wholly local to the memoized cell: no orchestrator
  // state and no context churn, so Phase B's render-layer memoization is untouched.
  const value = cell.getValue()
  const [prevValue, setPrevValue] = useState(value)
  const [flash, setFlash] = useState<{ dir: Exclude<FlashDir, null>; seq: number } | null>(null)
  if (!Object.is(prevValue, value)) {
    setPrevValue(value)
    setFlash((current) => ({ dir: flashDirection(prevValue, value), seq: (current?.seq ?? 0) + 1 }))
  }
  const align = cell.column.columnDef.meta?.align
  const isActions = cell.column.columnDef.meta?.actions === true
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
  const showCopy = onCopyCell !== undefined && !isActions && !isEditing && !isGroupCell
  const canContextMenu = onCellContextMenu !== undefined && !isGroupCell
  const editor = isEditing ? editing.editorFor(cell.column.id) : undefined
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  // Background precedence. An active range wins (accent tint + inset ring). Otherwise a sticky/pinned
  // cell paints its OWN opaque background — center cells stay transparent so the row's <tr> tint
  // (hover → surface-2, selection → accent-soft) shows through. Hover is now reserved to surface-2
  // and accent to selection/range, so the two reads never collide; a selected pinned cell still
  // picks up the accent tint so the selection band is unbroken across the frozen columns.
  const bgClass = rangeSelected
    ? 'bg-accent-soft ring-1 ring-inset ring-accent'
    : pinnedSide
      ? selected
        ? 'bg-accent-soft'
        : 'bg-surface group-hover:bg-surface-2'
      : ''
  const renderedContent = isEditing && editor ? (
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
  )
  return (
    <td
      role="gridcell"
      // select-none keeps a click-drag from starting a native text selection: cell ranges are
      // drag-selected, and a stray text selection would make Cmd/Ctrl+C copy raw page text instead
      // of the structured TSV (the copy handler defers to any live native selection). Edit inputs
      // are form controls and stay text-selectable regardless.
      className={`group/cell relative select-none ${bgClass} ${pinnedSide ? 'shadow-pinned' : ''} ${alignClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      data-column-id={cell.column.id}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      data-cell-dirty={isDirty ? 'true' : undefined}
      style={style}
      tabIndex={focused ? 0 : -1}
      aria-selected={rangeSelected ? true : undefined}
      onContextMenu={
        canContextMenu
          ? (event) => {
              event.preventDefault()
              onCellContextMenu!(cell.row.id, cell.column.id, event.clientX, event.clientY)
            }
          : undefined
      }
      onMouseDown={
        !isActions && !isGroupCell && rowIndex !== undefined && colIndex !== undefined
          ? (event) => {
              if (event.button !== 0) return
              event.currentTarget.focus()
              onRangeStart?.(rowIndex, colIndex)
            }
          : undefined
      }
      onMouseEnter={
        !isActions && !isGroupCell && rowIndex !== undefined && colIndex !== undefined
          ? () => onRangeEnter?.(rowIndex, colIndex)
          : undefined
      }
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
      {treePrefix && !isEditing ? (
        <span className="flex min-w-0 items-center gap-1.5">
          {treePrefix}
          <span className="min-w-0 truncate">{renderedContent}</span>
        </span>
      ) : (
        renderedContent
      )}
      {flash && !isGroupCell && !isEditing && (
        // One-shot highlight overlay; keyed by the change seq so each value change remounts it and
        // restarts the CSS animation. Sits above the cell background (doesn't disturb the td's own
        // bg/tint) and is purely decorative; onAnimationEnd unmounts it. Reduced-motion suppresses
        // the animation in base.css.
        <span
          key={flash.seq}
          aria-hidden="true"
          data-testid="cell-flash"
          className={`pointer-events-none absolute inset-0 cell-flash cell-flash-${flash.dir}`}
          onAnimationEnd={() => setFlash(null)}
        />
      )}
      {isDirty && !isEditing && (
        <span
          aria-hidden="true"
          data-testid="dirty-marker"
          className="absolute right-0 top-0 border-l-8 border-t-8 border-l-transparent border-t-accent"
        />
      )}
      {rangeCorner && !isEditing && onFillSelection !== undefined && (
        // Fill handle on the range's bottom-right corner. Click fills the range from each column's
        // anchor-row value (reuses the paste-fill path). mousedown is swallowed so it neither starts
        // a new cell-range drag nor blurs the focused cell.
        <button
          type="button"
          aria-label="Fill range"
          data-testid="fill-handle"
          tabIndex={-1}
          className="absolute -bottom-[3px] -right-[3px] z-20 h-2 w-2 cursor-crosshair rounded-[1px] border border-surface bg-accent"
          onMouseDown={(event) => {
            event.stopPropagation()
            event.preventDefault()
          }}
          onClick={(event) => {
            event.stopPropagation()
            onFillSelection()
          }}
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
            onCopyCell!(cell.row.id, cell.column.id)
          }}
        >
          <CopyGlyph />
        </button>
      )}
    </td>
  )
}

/**
 * Memoized on its per-cell props. `cell` is a stable TanStack ref (regenerated only when the row's
 * data or column config changes); every other prop is a primitive, or `undefined` for normal cells.
 * So React's default shallow comparison skips re-renders during unrelated grid updates while still
 * re-rendering on data, focus, range, pin, or group/tree-content changes. Context-driven values
 * (drag preview, editing) still re-render cells when they change, as required. The cast restores the
 * generic call signature that `memo()` erases.
 */
export const DataGridCell = memo(DataGridCellComponent) as typeof DataGridCellComponent
