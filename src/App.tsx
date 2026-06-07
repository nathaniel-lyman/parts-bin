import { useMemo, useState, type ReactNode } from 'react'
import { useAccounts, type NewAccount } from './hooks/useAccounts'
import { useTheme } from './hooks/useTheme'
import { useColumnVisibility } from './hooks/useColumnVisibility'
import { useServerData } from './hooks/useServerData'
import { totalMrr, activeCount, atRiskCount, avgGrowth } from './selectors/metrics'
import { fmtCurrency, fmtPercent } from './lib/format'
import { KpiCard } from './components/KpiCard'
import { DataTable } from './components/DataTable/DataTable'
import { DataGrid } from './components/DataGrid/DataGrid'
import { createMockServerAdapter } from './components/DataGrid/mockServerAdapter'
import { toGridQuery, type GridQuery } from './components/DataGrid/query'
import { DEFAULT_STATE } from './components/DataGrid/state'
import { AccountFormModal } from './components/AccountFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { MrrTrendChart } from './components/charts/MrrTrendChart'
import { MrrShareDonut } from './components/charts/MrrShareDonut'
import { RevenueMovementChart } from './components/charts/RevenueMovementChart'
import { Button } from './components/ui/Button'
import { useToast } from './components/ui/ToastContext'
import { sparks } from './data/accounts'
import type { Account } from './data/types'
import { accountGlobalFilter, accountGridColumns } from './components/accountGridColumns'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[2px] border border-line bg-surface p-4">
      <div className="micro mb-3">{title}</div>
      {children}
    </div>
  )
}

export default function App() {
  const { accounts, create, update, remove } = useAccounts()
  const { mode, toggle } = useTheme()
  const { visibility, toggle: toggleColumn, reset: resetColumns } = useColumnVisibility()
  const toast = useToast()

  const [editing, setEditing] = useState<Account | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const [serverMode, setServerMode] = useState(false)
  const [serverQuery, setServerQuery] = useState<GridQuery>(() => toGridQuery(DEFAULT_STATE))
  const serverAdapter = useMemo(() => createMockServerAdapter(accounts, { latencyMs: 80 }), [accounts])
  const server = useServerData(serverAdapter, serverQuery, { enabled: serverMode, debounceMs: 120 })
  const gridColumns = useMemo(() => accountGridColumns({ onEdit: setEditing, onDelete: setDeleting }), [])

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-6 border-b border-line bg-surface px-6 py-3">
        <span className="display text-[15px] font-bold text-ink"># Ledger</span>
        <nav className="flex gap-4 text-[13px]">
          <a className="text-muted hover:text-ink" href="#">Overview</a>
          <a className="text-accent" href="#">Accounts</a>
          <a className="text-muted hover:text-ink" href="#">Reports</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="num text-[12px] text-muted">demo · v1.0</span>
          <Button onClick={toggle}>{mode === 'dark' ? '☀ Light' : '◑ Dark'}</Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="micro">Revenue / Accounts</div>
        <div className="mb-6 flex items-end justify-between">
          <h1 className="display text-[28px] font-semibold text-ink">Account book</h1>
          <span className="num text-[13px] text-muted">{activeCount(accounts) + atRiskCount(accounts)} accounts · {fmtCurrency(totalMrr(accounts))} MRR</span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total MRR" value={fmtCurrency(totalMrr(accounts))} delta={4.6} spark={sparks.mrr} />
          <KpiCard label="Active accounts" value={String(activeCount(accounts))} delta={2.4} spark={sparks.accts} />
          <KpiCard label="Avg growth" value={fmtPercent(avgGrowth(accounts))} delta={1.1} spark={sparks.growth} />
          <KpiCard label="At risk / churned" value={String(atRiskCount(accounts))} delta={-12.5} spark={sparks.churn} negSpark />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="MRR trend ($k)"><MrrTrendChart /></Card>
          <Card title="MRR share — live"><MrrShareDonut accounts={accounts} /></Card>
        </div>
        <div className="mb-6">
          <Card title="Revenue movement ($k)"><RevenueMovementChart /></Card>
        </div>

        <DataTable
          accounts={accounts}
          visibility={visibility}
          onEdit={setEditing}
          onDelete={setDeleting}
          onNew={() => setCreating(true)}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
        />
        <div className="mt-4 flex items-center justify-between border border-line bg-surface px-3 py-2">
          <label className="micro flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              role="switch"
              aria-label="Server mode"
              checked={serverMode}
              onChange={(event) => setServerMode(event.target.checked)}
            />
            Server mode
          </label>
          {serverMode && (
            <span className="num text-[12px] text-muted">
              {server.status === 'loading' ? 'Loading server rows...' : `${server.totalRowCount} server rows`}
            </span>
          )}
        </div>
        {serverMode && (
          <div className="mt-4">
            <DataGrid
              rows={server.rows}
              columns={gridColumns}
              getRowId={(row) => row.id}
              globalFilterFn={accountGlobalFilter}
              manualSorting
              manualFiltering
              manualPagination
              enableHeaderFilters
              enableRowSelection
              totalRowCount={server.totalRowCount}
              onQueryChange={setServerQuery}
              loading={server.status === 'loading'}
              error={server.status === 'error' ? server.error : undefined}
            />
          </div>
        )}
      </main>

      {creating && (
        <AccountFormModal
          onClose={() => setCreating(false)}
          onInvalid={(msg) => toast(msg, 'warn')}
          onSubmit={(data: NewAccount) => { create(data); setCreating(false); toast(`Created ${data.name}`, 'pos') }}
        />
      )}
      {editing && (
        <AccountFormModal
          account={editing}
          onClose={() => setEditing(null)}
          onInvalid={(msg) => toast(msg, 'warn')}
          onSubmit={(data) => { update(editing.id, data); setEditing(null); toast(`Saved ${data.name}`, 'accent') }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete account"
          message={`Delete ${deleting.name}? This removes ${fmtCurrency(deleting.mrr)} of tracked MRR and its full history.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { remove(deleting.id); toast(`Deleted ${deleting.name}`, 'neg'); setDeleting(null) }}
        />
      )}
    </div>
  )
}
