import { type Row } from '@tanstack/react-table'
import { DataGridCell } from './DataGridCell'
import { DataGridRowCheckbox } from './DataGridSelectionCell'

interface Props<TData> {
  row: Row<TData>
  enableRowSelection?: boolean
  selected?: boolean
  pinned?: 'top' | 'bottom'
  rowLabel?: string
  onToggleRow?: (id: string) => void
  onCellContextMenu?: (rowId: string, colId: string, clientX: number, clientY: number) => void
}

export function DataGridRow<TData>({
  row,
  enableRowSelection,
  selected = false,
  pinned,
  rowLabel = row.id,
  onToggleRow,
  onCellContextMenu,
}: Props<TData>) {
  const toggle = () => onToggleRow?.(row.id)
  return (
    <tr
      role="row"
      className={`group border-t border-line hover:bg-surface-2 ${pinned ? 'bg-surface shadow-pinned' : ''}`}
      data-testid={`grid-row-${row.id}`}
      data-row-id={row.id}
      data-row-pinned={pinned}
      style={{ height: 'var(--row-h)' }}
      tabIndex={enableRowSelection ? 0 : undefined}
      aria-selected={enableRowSelection ? selected : undefined}
      onClick={enableRowSelection ? toggle : undefined}
      onKeyDown={
        enableRowSelection
          ? (event) => {
              if (event.key !== ' ') return
              event.preventDefault()
              toggle()
            }
          : undefined
      }
    >
      {enableRowSelection && (
        <td className="w-10 px-2 text-center">
          <DataGridRowCheckbox rowId={row.id} rowLabel={rowLabel} checked={selected} onToggle={(id) => onToggleRow?.(id)} />
        </td>
      )}
      {row.getVisibleCells().map((cell) => (
        <DataGridCell
          key={cell.id}
          cell={cell}
          onContextMenu={
            onCellContextMenu
              ? (event) => {
                  event.preventDefault()
                  onCellContextMenu(row.id, cell.column.id, event.clientX, event.clientY)
                }
              : undefined
          }
        />
      ))}
    </tr>
  )
}
