import { useVirtualizer } from '@tanstack/react-virtual'
import type { Row, Table } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { DataGridRow } from './DataGridRow'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridEditingApi } from './editing'
import type { GridFocus } from './keyboard'
import type { PinnedOffsets } from './selectors'
import type { ColumnVirtualWindow } from './types'
import type { CellRange } from './rangeSelection'

interface Props<TData> {
  table: Table<TData>
  enableRowSelection?: boolean
  rowSelection?: Record<string, boolean>
  rowHeight?: number
  enableVirtualization?: boolean
  scrollElement?: HTMLDivElement | null
  getRowLabel?: (row: TData, rowId: string) => string
  onToggleRow?: (id: string) => void
  onCellContextMenu?: (rowId: string, colId: string, clientX: number, clientY: number) => void
  onCopyCell?: (rowId: string, colId: string) => void
  dragPreview?: ColumnDragPreviewState | null
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

function defaultRowLabel<TData>(row: TData, rowId: string): string {
  // Group rows have no original data object.
  if (row === null || row === undefined) return rowId
  const record = row as Record<string, unknown>
  return String(record.name ?? record.account ?? rowId)
}

export function DataGridBody<TData>({
  table,
  enableRowSelection,
  rowSelection = {},
  rowHeight = 40,
  enableVirtualization = false,
  scrollElement,
  getRowLabel = defaultRowLabel,
  onToggleRow,
  onCellContextMenu,
  onCopyCell,
  dragPreview,
  focus,
  columnWindow,
  visibleColumnIds,
  onFocusCell,
  range,
  onRangeStart,
  onRangeEnter,
  pinnedOffsets,
  editing,
  renderAggregatedCell,
}: Props<TData>) {
  const topRows = table.getTopRows()
  const centerRows = table.getCenterRows()
  const bottomRows = table.getBottomRows()
  const colSpan = table.getVisibleLeafColumns().length + (enableRowSelection ? 1 : 0)

  // TanStack Virtual is the chosen windowing engine; React Compiler skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: centerRows.length,
    getScrollElement: () => scrollElement ?? null,
    estimateSize: () => rowHeight,
    overscan: 8,
    initialRect: { width: 1024, height: 640 },
  })

  const virtualItems = enableVirtualization ? rowVirtualizer.getVirtualItems() : []
  // Pair each visible center row with its index in centerRows so DataGridRow gets the index
  // directly instead of an O(n) indexOf per row (which is O(n²) across a render).
  const centerEntries: Array<{ row: Row<TData>; index: number }> = enableVirtualization
    ? virtualItems
        .map((item) => ({ row: centerRows[item.index], index: item.index }))
        .filter((entry): entry is { row: Row<TData>; index: number } => entry.row !== undefined)
    : centerRows.map((row, index) => ({ row, index }))
  const topSpacer = enableVirtualization ? (virtualItems[0]?.start ?? 0) : 0
  const bottomSpacer = enableVirtualization
    ? Math.max(0, rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0))
    : 0

  const renderRow = (row: Row<TData>, rowIndex: number, pinned?: 'top' | 'bottom') => (
    <DataGridRow
      key={`${pinned ?? 'row'}-${row.id}`}
      row={row}
      pinned={pinned}
      rowIndex={rowIndex}
      enableRowSelection={enableRowSelection}
      selected={rowSelection[row.id] === true}
      rowLabel={getRowLabel(row.original, row.id)}
      onToggleRow={onToggleRow}
      onCellContextMenu={onCellContextMenu}
      onCopyCell={onCopyCell}
      dragPreview={dragPreview}
      focus={focus}
      columnWindow={columnWindow}
      visibleColumnIds={visibleColumnIds}
      onFocusCell={onFocusCell}
      range={range}
      onRangeStart={onRangeStart}
      onRangeEnter={onRangeEnter}
      pinnedOffsets={pinnedOffsets}
      editing={editing}
      renderAggregatedCell={renderAggregatedCell}
    />
  )

  return (
    <tbody data-virtualized={enableVirtualization ? 'true' : 'false'} data-total-size={enableVirtualization ? rowVirtualizer.getTotalSize() : undefined}>
      {topRows.map((row) => renderRow(row, centerRows.indexOf(row), 'top'))}
      {topSpacer > 0 && (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: topSpacer, padding: 0 }} />
        </tr>
      )}
      {centerEntries.map(({ row, index }) => renderRow(row, index))}
      {bottomSpacer > 0 && (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: bottomSpacer, padding: 0 }} />
        </tr>
      )}
      {bottomRows.map((row) => renderRow(row, centerRows.indexOf(row), 'bottom'))}
    </tbody>
  )
}
