import { useVirtualizer } from '@tanstack/react-virtual'
import type { Row, Table } from '@tanstack/react-table'
import { DataGridRow } from './DataGridRow'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridFocus } from './keyboard'
import type { ColumnVirtualWindow } from './types'

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
  dragPreview?: ColumnDragPreviewState | null
  focus?: GridFocus
  columnWindow?: ColumnVirtualWindow
  visibleColumnIds?: string[]
  onFocusCell?: (row: number, col: number) => void
}

function defaultRowLabel<TData>(row: TData, rowId: string): string {
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
  dragPreview,
  focus,
  columnWindow,
  visibleColumnIds,
  onFocusCell,
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
  const virtualRows = enableVirtualization
    ? virtualItems.map((item) => centerRows[item.index]).filter((row): row is Row<TData> => row !== undefined)
    : centerRows
  const topSpacer = enableVirtualization ? (virtualItems[0]?.start ?? 0) : 0
  const bottomSpacer = enableVirtualization
    ? Math.max(0, rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0))
    : 0

  const renderRow = (row: Row<TData>, pinned?: 'top' | 'bottom') => (
    <DataGridRow
      key={`${pinned ?? 'row'}-${row.id}`}
      row={row}
      pinned={pinned}
      rowIndex={centerRows.indexOf(row)}
      enableRowSelection={enableRowSelection}
      selected={rowSelection[row.id] === true}
      rowLabel={getRowLabel(row.original, row.id)}
      onToggleRow={onToggleRow}
      onCellContextMenu={onCellContextMenu}
      dragPreview={dragPreview}
      focus={focus}
      columnWindow={columnWindow}
      visibleColumnIds={visibleColumnIds}
      onFocusCell={onFocusCell}
    />
  )

  return (
    <tbody data-virtualized={enableVirtualization ? 'true' : 'false'} data-total-size={enableVirtualization ? rowVirtualizer.getTotalSize() : undefined}>
      {topRows.map((row) => renderRow(row, 'top'))}
      {topSpacer > 0 && (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: topSpacer, padding: 0 }} />
        </tr>
      )}
      {virtualRows.map((row) => renderRow(row))}
      {bottomSpacer > 0 && (
        <tr aria-hidden="true">
          <td colSpan={colSpan} style={{ height: bottomSpacer, padding: 0 }} />
        </tr>
      )}
      {bottomRows.map((row) => renderRow(row, 'bottom'))}
    </tbody>
  )
}
