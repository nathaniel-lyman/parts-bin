import type { Account, Status } from '../data/types'
import { fmtCurrency, fmtDelta } from '../lib/format'
import { ACTIONS_COLUMN_ID } from './DataGrid/normalize'
import type { LedgerGridColumn } from './DataGrid/types'
import { StatusBadge } from './ui/Badge'

function withMeta(column: LedgerGridColumn<Account>): LedgerGridColumn<Account> {
  const align = column.align ?? 'left'
  return {
    ...column,
    meta: {
      align,
      resizable: column.id === ACTIONS_COLUMN_ID ? false : column.resizable !== false,
    },
  }
}

export function buildAccountGridColumns(
  onEdit: (account: Account) => void,
  onDelete: (account: Account) => void,
): LedgerGridColumn<Account>[] {
  const columns: LedgerGridColumn<Account>[] = [
    {
      id: 'account',
      accessorKey: 'name',
      header: 'Account',
      align: 'left',
      type: 'text',
      cell: (ctx) => <span className="text-ink">{String(ctx.value)}</span>,
    },
    {
      id: 'owner',
      accessorKey: 'owner',
      header: 'Owner',
      align: 'left',
      type: 'text',
      cell: (ctx) => <span className="text-muted">{String(ctx.value)}</span>,
    },
    {
      id: 'segment',
      accessorKey: 'segment',
      header: 'Segment',
      align: 'left',
      type: 'status',
      cell: (ctx) => <span className="text-muted">{String(ctx.value)}</span>,
    },
    {
      id: 'mrr',
      accessorKey: 'mrr',
      header: 'MRR',
      align: 'right',
      type: 'currency',
      cell: (ctx) => <span className="num text-ink">{fmtCurrency(Number(ctx.value))}</span>,
    },
    {
      id: 'growth',
      accessorKey: 'growth',
      header: 'Growth',
      align: 'right',
      type: 'percent',
      cell: (ctx) => (
        <span className={`num ${Number(ctx.value) < 0 ? 'text-neg' : 'text-pos'}`}>
          {fmtDelta(Number(ctx.value))}
        </span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      align: 'left',
      type: 'status',
      cell: (ctx) => <StatusBadge status={ctx.value as Status} />,
    },
    {
      id: 'arr',
      accessorKey: 'arr',
      header: 'ARR',
      align: 'right',
      type: 'currency',
      cell: (ctx) => <span className="num text-ink">{fmtCurrency(Number(ctx.value))}</span>,
    },
    {
      id: 'since',
      accessorKey: 'since',
      header: 'Since',
      align: 'left',
      type: 'date',
      cell: (ctx) => <span className="num text-muted">{String(ctx.value)}</span>,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      type: 'actions',
      hideable: false,
      sortable: false,
      reorderable: false,
      exportable: false,
      pinnable: true,
      cell: (ctx) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
          <button aria-label={`Edit ${ctx.row.name}`} className="text-muted hover:text-accent" onClick={() => onEdit(ctx.row)}>
            ✎
          </button>
          <button aria-label={`Delete ${ctx.row.name}`} className="text-muted hover:text-neg" onClick={() => onDelete(ctx.row)}>
            🗑
          </button>
        </div>
      ),
    },
  ]
  return columns.map(withMeta)
}

export function accountGlobalFilter(row: Account, value: string): boolean {
  const q = value.toLowerCase()
  return row.name.toLowerCase().includes(q) || row.owner.toLowerCase().includes(q)
}
