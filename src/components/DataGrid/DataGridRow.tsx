import { type Cell, type Row } from '@tanstack/react-table'
import { memo, type ReactNode } from 'react'
import { DataGridCell } from './DataGridCell'
import { DataGridRowCheckbox } from './DataGridSelectionCell'
import { useGridRuntime } from './GridRuntimeContext'

export interface DataGridRowProps<TData> {
  row: Row<TData>
  pinned?: 'top' | 'bottom'
  /** Index used for focus/range coordinates and the cell `data-row-index`. */
  rowIndex?: number
  selected?: boolean
  rowLabel?: string
  /** Column index focused in THIS row, or -1 when focus is elsewhere — kept as a primitive so the
   *  memoized row only re-renders when its own focus state changes. */
  focusedColIndex?: number
  /** Column span of the active cell range intersected with this row, or -1/-1 when not in range. */
  rangeColStart?: number
  rangeColEnd?: number
}

function DataGridRowComponent<TData>({
  row,
  pinned,
  rowIndex = row.index,
  selected = false,
  rowLabel = row.id,
  focusedColIndex = -1,
  rangeColStart = -1,
  rangeColEnd = -1,
}: DataGridRowProps<TData>) {
  const {
    enableRowSelection,
    onToggleRow,
    columnWindow,
    pinnedOffsets,
    renderAggregatedCell,
    treeColumnId,
    visibleColumnIds: runtimeColumnIds,
  } = useGridRuntime()
  // Context carries the grid-wide column order; fall back to the row's own cells so a row rendered
  // without a provider (focused component tests) still resolves column indices.
  const visibleColumnIds = runtimeColumnIds.length
    ? runtimeColumnIds
    : row.getVisibleCells().map((cell) => cell.column.id)
  const isGroupRow = row.getIsGrouped()
  const toggle = () => onToggleRow?.(row.id)
  const visibleColIndex = (columnId: string) => visibleColumnIds.indexOf(columnId)
  const resolvedTreeColumnId = treeColumnId ?? visibleColumnIds.find((id) => id !== 'actions')

  const groupCellContent = (cell: Cell<TData, unknown>): ReactNode => {
    const leafCount = row.getLeafRows().filter((leaf) => !leaf.getIsGrouped()).length
    const expanded = row.getIsExpanded()
    return (
      <span className="flex items-center gap-1.5" style={{ paddingLeft: row.depth * 16 }}>
        <button
          type="button"
          aria-label={expanded ? `Collapse ${String(cell.getValue() ?? row.id)}` : `Expand ${String(cell.getValue() ?? row.id)}`}
          aria-expanded={expanded}
          tabIndex={-1}
          className="flex h-5 w-5 items-center justify-center text-muted hover:text-accent"
          onClick={(event) => {
            event.stopPropagation()
            row.toggleExpanded()
          }}
        >
          <span aria-hidden="true" className="text-[15px] leading-none">{expanded ? '▾' : '▸'}</span>
        </button>
        <span className="text-ink">{String(cell.getValue() ?? '')}</span>
        <span className="micro text-muted">({leafCount})</span>
      </span>
    )
  }

  const aggregatedCellContent = (cell: Cell<TData, unknown>): ReactNode => {
    if (!renderAggregatedCell) return null
    const leafRows = row
      .getLeafRows()
      .filter((leaf) => !leaf.getIsGrouped())
      .map((leaf) => leaf.original)
    return renderAggregatedCell(cell.column.id, leafRows)
  }

  const renderCell = (cell: ReturnType<Row<TData>['getVisibleCells']>[number], pinnedSide?: 'left' | 'right') => {
    const colIndex = visibleColIndex(cell.column.id)
    const isGroupedCell = isGroupRow && cell.getIsGrouped()
    const isAggregatedCell = isGroupRow && !isGroupedCell
    const showTreePrefix = !isGroupRow && cell.column.id === resolvedTreeColumnId && (row.depth > 0 || row.getCanExpand())
    const treePrefix = showTreePrefix ? (
      <span className="flex shrink-0 items-center gap-1.5" style={{ paddingLeft: row.depth * 16 }}>
        {row.getCanExpand() ? (
          <button
            type="button"
            aria-label={row.getIsExpanded() ? `Collapse ${rowLabel}` : `Expand ${rowLabel}`}
            aria-expanded={row.getIsExpanded()}
            tabIndex={-1}
            className="flex h-5 w-5 items-center justify-center text-muted hover:text-accent"
            onClick={(event) => {
              event.stopPropagation()
              row.toggleExpanded()
            }}
          >
            <span aria-hidden="true" className="text-[15px] leading-none">{row.getIsExpanded() ? '▾' : '▸'}</span>
          </button>
        ) : (
          <span aria-hidden="true" className="inline-block w-5" />
        )}
      </span>
    ) : undefined
    return (
      <DataGridCell
        key={cell.id}
        cell={cell}
        rowIndex={rowIndex}
        colIndex={colIndex}
        focused={focusedColIndex >= 0 && focusedColIndex === colIndex}
        rangeSelected={rangeColStart >= 0 && colIndex >= rangeColStart && colIndex <= rangeColEnd}
        // Only sticky/pinned cells need the selection flag (their opaque bg hides the <tr> tint);
        // center cells inherit it from the row, so passing a constant false keeps them memo-stable
        // across a selection toggle — only the few pinned cells of the toggled row re-render.
        selected={pinnedSide ? selected : false}
        pinnedSide={pinnedSide}
        pinnedOffset={
          pinnedSide === 'left'
            ? pinnedOffsets?.left[cell.column.id] ?? 0
            : pinnedSide === 'right'
              ? pinnedOffsets?.right[cell.column.id] ?? 0
              : 0
        }
        groupContent={isGroupedCell ? groupCellContent(cell) : undefined}
        aggregatedContent={isAggregatedCell ? aggregatedCellContent(cell) : undefined}
        treePrefix={treePrefix}
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
  // Selection wins over the hover/group/pinned background so the tint is unambiguous; the accent
  // band stays put on hover (no surface-2 override) so a selected row never looks deselected.
  const rowBgClass = selected
    ? 'bg-accent-soft'
    : `hover:bg-surface-2 ${pinned ? 'bg-surface' : ''} ${isGroupRow ? 'bg-surface-2' : ''}`
  return (
    <tr
      role="row"
      className={`group border-t border-line ${rowBgClass} ${pinned ? 'shadow-pinned' : ''}`}
      data-testid={`grid-row-${row.id}`}
      data-row-id={row.id}
      data-row-pinned={pinned}
      data-row-grouped={isGroupRow ? 'true' : undefined}
      data-row-depth={row.depth}
      style={{ height: 'var(--row-h)' }}
      tabIndex={enableRowSelection && !isGroupRow ? 0 : undefined}
      aria-selected={enableRowSelection && !isGroupRow ? selected : undefined}
      aria-expanded={row.getCanExpand() ? row.getIsExpanded() : undefined}
      aria-level={!isGroupRow && row.depth > 0 ? row.depth + 1 : undefined}
      onClick={
        isGroupRow
          ? () => row.toggleExpanded()
          : enableRowSelection
            ? toggle
            : undefined
      }
      onKeyDown={
        enableRowSelection && !isGroupRow
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
        <td className={`sticky left-0 z-10 w-10 px-2 text-center ${selected ? 'bg-accent-soft' : 'bg-surface group-hover:bg-surface-2'}`}>
          {!isGroupRow && (
            <DataGridRowCheckbox rowId={row.id} rowLabel={rowLabel} checked={selected} onToggle={(id) => onToggleRow?.(id)} />
          )}
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

/**
 * Memoized on its per-row props. `row` is a stable TanStack ref (regenerated only when that row's
 * data changes); the rest are primitives (`selected`, `rowIndex`, the focus/range column indices,
 * `rowLabel`). So a render that only changes another row's state — or grid-wide state carried by
 * GridRuntimeContext — leaves this row's props untouched and the default shallow comparison skips
 * it. The cast restores the generic call signature that `memo()` erases.
 */
export const DataGridRow = memo(DataGridRowComponent) as typeof DataGridRowComponent
