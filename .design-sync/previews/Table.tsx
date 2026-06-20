import { Table } from 'parts-bin'

type Account = { id: string; account: string; plan: string; mrr: string; status: string }

const accounts: Account[] = [
  { id: 'a', account: 'Northwind Traders', plan: 'Enterprise', mrr: '$4,200', status: 'Active' },
  { id: 'b', account: 'Globex Corp', plan: 'Pro', mrr: '$1,890', status: 'Active' },
  { id: 'c', account: 'Initech', plan: 'Starter', mrr: '$420', status: 'At risk' },
  { id: 'd', account: 'Umbrella LLC', plan: 'Pro', mrr: '$1,200', status: 'Churned' },
]

export function AccountsByMrr() {
  return (
    <div style={{ width: 480 }}>
      <Table<Account>
        caption="Accounts by MRR"
        columns={[
          { key: 'account', header: 'Account' },
          { key: 'plan', header: 'Plan' },
          { key: 'mrr', header: 'MRR', numeric: true },
          { key: 'status', header: 'Status' },
        ]}
        rows={accounts}
        rowKey={(r) => r.id}
      />
    </div>
  )
}
