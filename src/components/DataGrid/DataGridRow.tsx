import { type Cell, type Row } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { DataGridCell } from './DataGridCell'
import { DataGridRowCheckbox } from './DataGridSelectionCell'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridEditingApi } from './editing'
import type { GridFocus } from './keyboard'
import type { PinnedOffsets } from './selectors'
import type { ColumnVirtualWindow } from './types'
import type { CellRange } from './rangeSelection'
import { isCellInRange } from './rangeSelection'

interface Props<TData> {
  row: Row<TData>
  enableRowSelection?: boolean
  selected?: boolean
  pinned?: 'top' | 'bottom'
  rowLabel?: string
  onToggleRow?: (id: string) => void
  onCellContextMenu?: (rowId: string, colId: string, clientX: number, clientY: number) => void
  onCopyCell?: (rowId: string, colId: string) => void
  dragPreview?: ColumnDragPreviewState | null
  rowIndex?: number
  focus?: GridFocus
  columnWindow?: ColumnVirtualWindow
  visibleColumnIds?: string[]
  onFocusCell?: (row: number, col: number) => void
  range?: CellRange | null
  onRangeStart?: (row: number, col: number) => void
  onRangeEnter?: (row: number, col: number) => void
  pinnedOffsets?: PinnedOffsets
  editing?: GridEditingApi
  renderAggregatedCell?: (columnId: string, leafRows: TData[]) => ReactNode
}

export function DataGridRow<TData>({
  row,
  enableRowSelection,
  selected = false,
  pinned,
  rowLabel = row.id,
  onToggleRow,
  onCellContextMenu,
  onCopyCell,
  dragPreview,
  rowIndex = row.index,
  focus,
  columnWindow,
  visibleColumnIds = row.getVisibleCells().map((cell) => cell.column.id),
  onFocusCell,
  range,
  onRangeStart,
  onRangeEnter,
  pinnedOffsets,
  editing,
  renderAggregatedCell,
}: Props<TData>) {
  const isGroupRow = row.getIsGrouped()
  const toggle = () => onToggleRow?.(row.id)
  const visibleColIndex = (columnId: string) => visibleColumnIds.indexOf(columnId)

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
          className="text-muted hover:text-accent"
          onClick={(event) => {
            event.stopPropagation()
            row.toggleExpanded()
          }}
        >
          <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
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
    return (
      <DataGridCell
        key={cell.id}
        cell={cell}
        dragPreview={dragPreview}
        rowIndex={rowIndex}
        colIndex={colIndex}
        focused={focus?.row === rowIndex && focus.col === colIndex}
        rangeSelected={isCellInRange(range ?? null, rowIndex, colIndex)}
        pinnedSide={pinnedSide}
        pinnedOffset={
          pinnedSide === 'left'
            ? pinnedOffsets?.left[cell.column.id] ?? 0
            : pinnedSide === 'right'
              ? pinnedOffsets?.right[cell.column.id] ?? 0
              : 0
        }
        onFocusCell={onFocusCell}
        onRangeStart={onRangeStart}
        onRangeEnter={onRangeEnter}
        editing={isGroupRow ? undefined : editing}
        groupContent={isGroupedCell ? groupCellContent(cell) : undefined}
        aggregatedContent={isAggregatedCell ? aggregatedCellContent(cell) : undefined}
        onCopy={onCopyCell && !isGroupRow ? () => onCopyCell(row.id, cell.column.id) : undefined}
        onContextMenu={
          onCellContextMenu && !isGroupRow
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
      className={`group border-t border-line hover:bg-surface-2 ${pinned ? 'bg-surface shadow-pinned' : ''} ${isGroupRow ? 'bg-surface-2' : ''}`}
      data-testid={`grid-row-${row.id}`}
      data-row-id={row.id}
      data-row-pinned={pinned}
      data-row-grouped={isGroupRow ? 'true' : undefined}
      style={{ height: 'var(--row-h)' }}
      tabIndex={enableRowSelection && !isGroupRow ? 0 : undefined}
      aria-selected={enableRowSelection && !isGroupRow ? selected : undefined}
      aria-expanded={isGroupRow ? row.getIsExpanded() : undefined}
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
        <td className="sticky left-0 z-10 w-10 bg-surface px-2 text-center">
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
