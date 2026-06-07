import { createColumnHelper, type Row } from '@tanstack/react-table'
import type { Account } from '../../data/types'
import { fmtCurrency, fmtDelta } from '../../lib/format'
import { StatusBadge } from '../ui/Badge'

// Let columns declare text alignment via meta without unsafe casts.
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
  }
}

const col = createColumnHelper<Account>()

export function buildColumns(onEdit: (a: Account) => void, onDelete: (a: Account) => void) {
  return [
    col.accessor('name', { id: 'account', header: 'Account', cell: (c) => <span className="text-ink">{c.getValue()}</span> }),
    col.accessor('owner', { header: 'Owner', cell: (c) => <span className="text-muted">{c.getValue()}</span> }),
    col.accessor('segment', { header: 'Segment', cell: (c) => <span className="text-muted">{c.getValue()}</span> }),
    col.accessor('mrr', { header: 'MRR', cell: (c) => <span className="num text-ink">{fmtCurrency(c.getValue())}</span>, meta: { align: 'right' } }),
    col.accessor('growth', {
      header: 'Growth',
      cell: (c) => <span className={`num ${c.getValue() < 0 ? 'text-neg' : 'text-pos'}`}>{fmtDelta(c.getValue())}</span>,
      meta: { align: 'right' },
    }),
    col.accessor('status', { header: 'Status', cell: (c) => <StatusBadge status={c.getValue()} /> }),
    // optional columns (hidden by default; toggled via visibility)
    col.accessor('arr', { id: 'arr', header: 'ARR', cell: (c) => <span className="num text-ink">{fmtCurrency(c.getValue())}</span>, meta: { align: 'right' } }),
    col.accessor('since', { id: 'since', header: 'Since', cell: (c) => <span className="num text-muted">{c.getValue()}</span> }),
    col.display({
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: (c) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
          <button aria-label={`Edit ${c.row.original.name}`} className="text-muted hover:text-accent" onClick={() => onEdit(c.row.original)}>✎</button>
          <button aria-label={`Delete ${c.row.original.name}`} className="text-muted hover:text-neg" onClick={() => onDelete(c.row.original)}>🗑</button>
        </div>
      ),
    }),
  ]
}

// global filter matches account name + owner (spec §10)
export const accountGlobalFilter = (row: Row<Account>, _id: string, value: string) => {
  const q = value.toLowerCase()
  return row.original.name.toLowerCase().includes(q) || row.original.owner.toLowerCase().includes(q)
}
