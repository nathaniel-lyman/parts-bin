import type { Account, Status } from '../data/types'
import { fmtCurrency, fmtDelta } from '../lib/format'
import { ACTIONS_COLUMN_ID } from './DataGrid/normalize'
import { DEFAULT_STATE } from './DataGrid/state'
import type { LedgerGridColumn, LedgerGridState } from './DataGrid/types'
import { StatusBadge, type BadgeTone } from './ui/Badge'

/**
 * Demo mapping: Account lifecycle `Status` → `StatusBadge` tone. Lives in the
 * demo layer on purpose so the generic `StatusBadge` carries no status vocabulary.
 */
export const statusTone = (status: Status): BadgeTone =>
  status === 'Active' ? 'pos' : status === 'At risk' ? 'warn' : 'neg'

export const ACCOUNT_GRID_COLUMN_ORDER = [
  'account',
  'owner',
  'segment',
  'mrr',
  'growth',
  'status',
  'arr',
  'since',
  ACTIONS_COLUMN_ID,
]

export const ACCOUNT_GRID_INITIAL_STATE: LedgerGridState = {
  ...DEFAULT_STATE,
  sorting: [{ id: 'mrr', desc: true }],
  columnVisibility: { account: true, arr: false, since: false },
  columnOrder: [...ACCOUNT_GRID_COLUMN_ORDER],
  columnPinning: { left: [], right: [ACTIONS_COLUMN_ID] },
}

function withMeta(column: LedgerGridColumn<Account>): LedgerGridColumn<Account> {
  const align = column.align ?? 'left'
  const filterType = column.id === 'segment' ? 'enum' : column.type === 'actions' ? undefined : column.type
  return {
    ...column,
    meta: {
      align,
      resizable: column.id === ACTIONS_COLUMN_ID ? false : column.resizable !== false,
      ...(filterType ? { type: filterType } : {}),
      ...(column.id === 'segment' ? { options: ['Enterprise', 'Mid-market', 'Startup'] } : {}),
      ...(column.id === 'status' ? { options: ['Active', 'At risk', 'Churned'] } : {}),
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
      editable: true,
      validate: (value) => (String(value).trim() === '' ? 'Name is required' : null),
      cell: (ctx) => <span className="text-ink">{String(ctx.value)}</span>,
    },
    {
      id: 'owner',
      accessorKey: 'owner',
      header: 'Owner',
      align: 'left',
      type: 'text',
      editable: true,
      groupable: true,
      validate: (value) => (String(value).trim() === '' ? 'Owner is required' : null),
      cell: (ctx) => <span className="text-muted">{String(ctx.value)}</span>,
    },
    {
      id: 'segment',
      accessorKey: 'segment',
      header: 'Segment',
      align: 'left',
      type: 'status',
      editable: true,
      groupable: true,
      cell: (ctx) => <span className="text-muted">{String(ctx.value)}</span>,
    },
    {
      id: 'mrr',
      accessorKey: 'mrr',
      header: 'MRR',
      align: 'right',
      type: 'currency',
      editable: true,
      aggregate: 'sum',
      validate: (value) => (Number(value) < 0 ? 'MRR cannot be negative' : null),
      cell: (ctx) => <span className="num text-ink">{fmtCurrency(Number(ctx.value))}</span>,
    },
    {
      id: 'growth',
      accessorKey: 'growth',
      header: 'Growth',
      align: 'right',
      type: 'percent',
      editable: true,
      aggregate: 'avg',
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
      editable: true,
      groupable: true,
      cell: (ctx) => <StatusBadge status={ctx.value as Status} tone={statusTone(ctx.value as Status)} />,
    },
    {
      id: 'arr',
      accessorKey: 'arr',
      header: 'ARR',
      align: 'right',
      type: 'currency',
      aggregate: 'sum',
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
      header: 'Actions',
      width: 76,
      minWidth: 76,
      maxWidth: 76,
      align: 'right',
      type: 'actions',
      hideable: false,
      sortable: false,
      reorderable: false,
      exportable: false,
      pinnable: true,
      cell: (ctx) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" aria-label={`Edit ${ctx.row.name}`} className="text-muted hover:text-accent" onClick={(event) => { event.stopPropagation(); onEdit(ctx.row) }}>
            ✎
          </button>
          <button type="button" aria-label={`Delete ${ctx.row.name}`} className="text-muted hover:text-neg" onClick={(event) => { event.stopPropagation(); onDelete(ctx.row) }}>
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

export function accountGridColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}): LedgerGridColumn<Account>[] {
  return buildAccountGridColumns(onEdit, onDelete)
}
