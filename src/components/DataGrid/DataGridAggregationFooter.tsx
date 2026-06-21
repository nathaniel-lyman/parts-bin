import type { Table } from '@tanstack/react-table'
import type { ColumnAggregate } from './aggregation'
import type { PinnedOffsets } from './selectors'
import type { ColumnVirtualWindow } from './types'

interface Props<TData> {
  table: Table<TData>
  aggregates: Record<string, ColumnAggregate>
  rowCount: number
  enableRowSelection?: boolean
  columnWindow?: ColumnVirtualWindow
  pinnedOffsets?: PinnedOffsets
}

/** Sticky totals row over the filtered (not just paginated) leaf rows. */
export function DataGridAggregationFooter<TData>({
  table,
  aggregates,
  rowCount,
  enableRowSelection,
  columnWindow,
  pinnedOffsets,
}: Props<TData>) {
  const leftColumns = table.getLeftVisibleLeafColumns()
  const centerColumns = table.getCenterVisibleLeafColumns()
  const rightColumns = table.getRightVisibleLeafColumns()
  const windowedCenter = columnWindow
    ? centerColumns.filter((column) => columnWindow.ids.includes(column.id))
    : centerColumns
  const firstDataColumnId = [...leftColumns, ...centerColumns, ...rightColumns].find(
    (column) => !aggregates[column.id] && column.id !== 'actions',
  )?.id

  const renderCell = (columnId: string, size: number, pinnedSide?: 'left' | 'right') => {
    const aggregateEntry = aggregates[columnId]
    const align = (() => {
      const column = pinnedSide === 'left'
        ? leftColumns.find((item) => item.id === columnId)
        : pinnedSide === 'right'
          ? rightColumns.find((item) => item.id === columnId)
          : centerColumns.find((item) => item.id === columnId)
      return column?.columnDef.meta?.align
    })()
    return (
      <td
        key={columnId}
        data-column-id={columnId}
        data-testid={`agg-footer-${columnId}`}
        className={`border-r border-line px-3 py-2 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${pinnedSide ? 'bg-surface-2 shadow-pinned' : ''}`}
        style={{
          minWidth: size,
          width: size,
          ...(pinnedSide === 'left' ? { position: 'sticky', left: pinnedOffsets?.left[columnId] ?? 0, zIndex: 10 } : {}),
          ...(pinnedSide === 'right' ? { position: 'sticky', right: pinnedOffsets?.right[columnId] ?? 0, zIndex: 10 } : {}),
        }}
      >
        {aggregateEntry ? (
          <span className="num text-ink">
            <span className="micro mr-1 text-faint">{aggregateEntry.label}</span>
            {aggregateEntry.formatted}
          </span>
        ) : columnId === firstDataColumnId ? (
          <span className="micro text-muted">{rowCount} {rowCount === 1 ? 'row' : 'rows'}</span>
        ) : null}
      </td>
    )
  }

  return (
    <tfoot data-testid="grid-aggregation-footer" className="sticky bottom-0 z-20 bg-surface-2">
      <tr className="border-t border-line bg-surface-2">
        {enableRowSelection && <td className="sticky left-0 z-30 w-10 border-r border-line bg-surface-2 px-2 shadow-pinned" />}
        {leftColumns.map((column) => renderCell(column.id, column.getSize(), 'left'))}
        {columnWindow && columnWindow.paddingLeft > 0 && (
          <td aria-hidden="true" data-column-spacer="left" style={{ minWidth: columnWindow.paddingLeft, width: columnWindow.paddingLeft, padding: 0 }} />
        )}
        {windowedCenter.map((column) => renderCell(column.id, column.getSize()))}
        {columnWindow && columnWindow.paddingRight > 0 && (
          <td aria-hidden="true" data-column-spacer="right" style={{ minWidth: columnWindow.paddingRight, width: columnWindow.paddingRight, padding: 0 }} />
        )}
        {rightColumns.map((column) => renderCell(column.id, column.getSize(), 'right'))}
      </tr>
    </tfoot>
  )
}
