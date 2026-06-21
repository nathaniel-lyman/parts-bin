import { useVirtualizer } from '@tanstack/react-virtual'
import type { Row, Table } from '@tanstack/react-table'
import { Fragment, type ReactNode } from 'react'
import { DataGridRow } from './DataGridRow'
import { useGridRuntime } from './GridRuntimeContext'
import type { GridFocus } from './keyboard'
import { cellRangeBounds, type CellRange } from './rangeSelection'

interface Props<TData> {
  table: Table<TData>
  rowSelection?: Record<string, boolean>
  rowHeight?: number
  enableVirtualization?: boolean
  scrollElement?: HTMLDivElement | null
  getRowLabel?: (row: TData, rowId: string) => string
  focus?: GridFocus
  range?: CellRange | null
  renderDetailPanel?: (ctx: { row: TData; rowId: string }) => ReactNode
}

function defaultRowLabel<TData>(row: TData, rowId: string): string {
  // Group rows have no original data object.
  if (row === null || row === undefined) return rowId
  const record = row as Record<string, unknown>
  return String(record.name ?? record.account ?? rowId)
}

export function DataGridBody<TData>({
  table,
  rowSelection = {},
  rowHeight = 40,
  enableVirtualization = false,
  scrollElement,
  getRowLabel = defaultRowLabel,
  focus,
  range,
  renderDetailPanel,
}: Props<TData>) {
  const { enableRowSelection } = useGridRuntime()
  const topRows = table.getTopRows()
  const centerRows = table.getCenterRows()
  const bottomRows = table.getBottomRows()
  const colSpan = table.getVisibleLeafColumns().length + (enableRowSelection ? 1 : 0)
  // Bounds of the active range, computed once; rows derive their own narrow column span from it.
  const rangeBounds = range ? cellRangeBounds(range) : null

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

  // Pinned (top/bottom) rows are not part of centerRows, so `centerRows.indexOf(row)` is both O(n)
  // per pinned row and always -1. Resolve the center index via a one-time id→index map instead —
  // built only when rows are actually pinned, so the common no-pinned (virtualized) path adds nothing.
  const hasPinnedRows = topRows.length > 0 || bottomRows.length > 0
  const centerIndexById = hasPinnedRows
    ? new Map(centerRows.map((row, index) => [row.id, index]))
    : undefined
  const pinnedRowIndex = (row: Row<TData>) => centerIndexById?.get(row.id) ?? -1

  const renderRow = (row: Row<TData>, rowIndex: number, pinned?: 'top' | 'bottom') => {
    const rowLabel = getRowLabel(row.original, row.id)
    const detail = renderDetailPanel && !row.getIsGrouped() && row.getIsExpanded()
      ? renderDetailPanel({ row: row.original, rowId: row.id })
      : null
    const focusedColIndex = focus && focus.row === rowIndex ? focus.col : -1
    const inRange = rangeBounds !== null && rowIndex >= rangeBounds.rowStart && rowIndex <= rangeBounds.rowEnd
    return (
      <Fragment key={`${pinned ?? 'row'}-${row.id}-fragment`}>
        <DataGridRow
          key={`${pinned ?? 'row'}-${row.id}`}
          row={row}
          pinned={pinned}
          rowIndex={rowIndex}
          selected={rowSelection[row.id] === true}
          rowLabel={rowLabel}
          focusedColIndex={focusedColIndex}
          rangeColStart={inRange ? rangeBounds.colStart : -1}
          rangeColEnd={inRange ? rangeBounds.colEnd : -1}
        />
        {detail && (
          <tr key={`${pinned ?? 'row'}-${row.id}-detail`} role="row" data-testid={`grid-row-${row.id}-detail`} data-row-detail="true">
            <td colSpan={colSpan} className="border-t border-line bg-surface-2 px-4 py-3">
              {detail}
            </td>
          </tr>
        )}
      </Fragment>
    )
  }

  return (
    <tbody data-virtualized={enableVirtualization ? 'true' : 'false'} data-total-size={enableVirtualization ? rowVirtualizer.getTotalSize() : undefined}>
      {topRows.map((row) => renderRow(row, pinnedRowIndex(row), 'top'))}
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
      {bottomRows.map((row) => renderRow(row, pinnedRowIndex(row), 'bottom'))}
    </tbody>
  )
}
