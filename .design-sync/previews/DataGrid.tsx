import { DataGrid, StatusBadge } from 'parts-bin'

type Account = {
  id: string
  name: string
  owner: string
  segment: string
  mrr: number
  growth: number
  status: 'Active' | 'At risk' | 'Churned'
}

const rows: Account[] = [
  { id: 'a1', name: 'Cobalt Freight', owner: 'K. Osei', segment: 'Enterprise', mrr: 24600, growth: -2.1, status: 'At risk' },
  { id: 'a2', name: 'Meridian Corp', owner: 'K. Osei', segment: 'Enterprise', mrr: 18400, growth: 6.2, status: 'Active' },
  { id: 'a3', name: 'Northwind Paper', owner: 'J. Park', segment: 'Enterprise', mrr: 15750, growth: 3.9, status: 'Active' },
  { id: 'a4', name: 'Bluestem Health', owner: 'J. Park', segment: 'Mid-market', mrr: 9200, growth: 12.8, status: 'Active' },
  { id: 'a5', name: 'Harbor & Pine', owner: 'M. Chen', segment: 'Mid-market', mrr: 6800, growth: 0.4, status: 'Active' },
  { id: 'a6', name: 'Solstice Media', owner: 'M. Chen', segment: 'Mid-market', mrr: 4300, growth: -14.2, status: 'Churned' },
  { id: 'a7', name: 'Foxglove Labs', owner: 'A. Rivera', segment: 'Startup', mrr: 2150, growth: 31.4, status: 'Active' },
  { id: 'a8', name: 'Quill Analytics', owner: 'A. Rivera', segment: 'Startup', mrr: 1400, growth: -8.6, status: 'At risk' },
]

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const statusTone: Record<Account['status'], 'pos' | 'warn' | 'neg'> = {
  Active: 'pos',
  'At risk': 'warn',
  Churned: 'neg',
}

const columns = [
  { id: 'name', accessorKey: 'name', header: 'Account', sortable: true },
  { id: 'owner', accessorKey: 'owner', header: 'Owner', sortable: true },
  { id: 'segment', accessorKey: 'segment', header: 'Segment', sortable: true, groupable: true },
  {
    id: 'mrr',
    accessorKey: 'mrr',
    header: 'MRR',
    type: 'currency' as const,
    align: 'right' as const,
    sortable: true,
    aggregate: 'sum' as const,
    cell: ({ value }: { value: number }) => <span className="num">{usd(value)}</span>,
  },
  {
    id: 'growth',
    accessorKey: 'growth',
    header: 'Growth',
    type: 'percent' as const,
    align: 'right' as const,
    sortable: true,
    cell: ({ value }: { value: number }) => (
      <span className={value < 0 ? 'num text-neg' : 'num text-pos'}>
        {value > 0 ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    type: 'status' as const,
    cell: ({ value }: { value: Account['status'] }) => (
      <StatusBadge status={value} tone={statusTone[value]} />
    ),
  },
]

export function AccountsGrid() {
  return (
    <div style={{ width: 880 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        quickFilterPlaceholder="Filter accounts…"
      />
    </div>
  )
}

export function WithSelection() {
  return (
    <div style={{ width: 880 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        enableRowSelection
        initialState={{ rowSelection: { a2: true, a4: true } }}
        quickFilterPlaceholder="Filter accounts…"
      />
    </div>
  )
}
