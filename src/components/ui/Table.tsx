import type { ReactNode } from 'react'
import { cx } from './utils'

export interface TableColumn<Row> {
  /** Row property to read when no `render` is given; also the React key. */
  key: string
  header: ReactNode
  /** Right-aligns and applies tabular figures (`.num`). */
  numeric?: boolean
  /** Optional fixed width, e.g. '120px' or '20%'. */
  width?: string
  render?: (row: Row) => ReactNode
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string | number
  /** Accessible table name (visually hidden). */
  caption?: string
  emptyMessage?: ReactNode
  className?: string
}

/**
 * Lightweight static table for small read-only datasets (detail panels, card
 * breakdowns). No sorting, filtering, or selection — reach for DataGrid when
 * the data needs to be worked with.
 */
export function Table<Row>({ columns, rows, rowKey, caption, emptyMessage = 'No data', className }: TableProps<Row>) {
  return (
    <table className={cx('w-full border-collapse text-[14px] text-ink', className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr className="border-b border-line">
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              style={column.width ? { width: column.width } : undefined}
              className={cx('micro px-2 py-2 text-left font-medium', column.numeric && 'text-right')}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-line last:border-b-0 hover:bg-surface-2">
            {columns.map((column) => (
              <td key={column.key} className={cx('px-2 py-2', column.numeric && 'num text-right')}>
                {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
              </td>
            ))}
          </tr>
        )) : (
          <tr>
            <td colSpan={columns.length} className="px-2 py-6 text-center text-muted">{emptyMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
