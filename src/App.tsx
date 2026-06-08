import { useMemo, useState } from 'react'
import { useAccounts, type NewAccount } from './hooks/useAccounts'
import { useTheme } from './hooks/useTheme'
import { useServerData } from './hooks/useServerData'
import { totalMrr, activeCount, atRiskCount, avgGrowth } from './selectors/metrics'
import { fmtCurrency, fmtPercent } from './lib/format'
import { KpiCard, KpiSummaryRow } from './components/KpiCard'
import { DataGrid } from './components/DataGrid/DataGrid'
import { createMockServerAdapter, generateAccounts } from './components/DataGrid/mockServerAdapter'
import { toGridQuery, type GridQuery } from './components/DataGrid/query'
import { DEFAULT_STATE } from './components/DataGrid/state'
import { AccountFormModal } from './components/AccountFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { MrrTrendChart } from './components/charts/MrrTrendChart'
import { MrrShareDonut } from './components/charts/MrrShareDonut'
import { RevenueMovementChart } from './components/charts/RevenueMovementChart'
import { WaterfallChart } from './components/charts/WaterfallChart'
import { DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH, REVENUE_MOVEMENT_BAR_WIDTH_RANGE } from './components/charts/revenueMovementChartConfig'
import { Button, Card, PageHeader, Switch, useToast } from './components/ui'
import {
  AppShell,
  CalendarIconButton,
  FilterButton,
  GlobalSearchInput,
  LeftNavigationDrawer,
  NotificationButton,
  TimePeriodSelector,
  TopNav,
  UserAvatarMenu,
} from './components/shell'
import { DocsPage } from './components/docs/DocsPage'
import { revenueWaterfallSeries, sparks } from './data/accounts'
import type { Account } from './data/types'
import { accountGlobalFilter, accountGridColumns } from './components/accountGridColumns'

const timePeriodOptions = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
]

function formatCompactKValue(value: number) {
  const absolute = Math.abs(value)
  return absolute >= 10 || Number.isInteger(absolute) ? absolute.toFixed(0) : absolute.toFixed(1)
}

function formatCurrencyK(value: number) {
  return `${value < 0 ? '-' : ''}$${formatCompactKValue(value)}k`
}

interface DashboardPageProps {
  globalSearch: string
  atRiskOnly: boolean
  timePeriodLabel: string
}

function DashboardPage({ globalSearch, atRiskOnly, timePeriodLabel }: DashboardPageProps) {
  const { accounts, create, update, remove } = useAccounts()
  const toast = useToast()
  const params = new URLSearchParams(window.location.search)
  const requestedRows = Number(params.get('rows') ?? 0)
  const generatedAccounts = useMemo(
    () => (Number.isFinite(requestedRows) && requestedRows > 0 ? generateAccounts(requestedRows) : null),
    [requestedRows],
  )
  const visibleAccounts = useMemo(() => {
    let next = generatedAccounts ?? accounts
    const query = globalSearch.trim()
    if (query) next = next.filter((account) => accountGlobalFilter(account, query))
    if (atRiskOnly) next = next.filter((account) => account.status !== 'Active')
    return next
  }, [accounts, atRiskOnly, generatedAccounts, globalSearch])
  const gridInitialState = useMemo(
    () => (generatedAccounts ? { ...DEFAULT_STATE, sorting: [] } : DEFAULT_STATE),
    [generatedAccounts],
  )

  const [editing, setEditing] = useState<Account | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const [serverMode, setServerMode] = useState(params.get('server') === '1')
  const [serverQuery, setServerQuery] = useState<GridQuery>(() => toGridQuery(DEFAULT_STATE))
  const [movementBarWidth, setMovementBarWidth] = useState(DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH)
  const [movementLabels, setMovementLabels] = useState(false)
  const serverAdapter = useMemo(() => createMockServerAdapter(visibleAccounts, { latencyMs: 80 }), [visibleAccounts])
  const server = useServerData(serverAdapter, serverQuery, { enabled: serverMode, debounceMs: 120 })
  const gridColumns = useMemo(() => accountGridColumns({ onEdit: setEditing, onDelete: setDeleting }), [setDeleting, setEditing])

  return (
    <>
      <main className="mx-auto max-w-[1400px] px-6 py-6">
        <PageHeader
          eyebrow="Revenue / Accounts"
          title="Account book"
          description={`${timePeriodLabel}${atRiskOnly ? ' · At-risk focus' : ''}${globalSearch.trim() ? ` · Search: ${globalSearch.trim()}` : ''}`}
          actions={
            <span className="num text-[13px] text-muted">
              {activeCount(visibleAccounts) + atRiskCount(visibleAccounts)} accounts · {fmtCurrency(totalMrr(visibleAccounts))} MRR
            </span>
          }
        />

        <KpiSummaryRow>
          <KpiCard label="Total MRR" value={fmtCurrency(totalMrr(visibleAccounts))} delta={4.6} spark={sparks.mrr} />
          <KpiCard label="Active accounts" value={String(activeCount(visibleAccounts))} delta={2.4} spark={sparks.accts} />
          <KpiCard label="Avg growth" value={fmtPercent(avgGrowth(visibleAccounts))} delta={1.1} spark={sparks.growth} />
          <KpiCard label="At risk / churned" value={String(atRiskCount(visibleAccounts))} delta={-12.5} spark={sparks.churn} negSpark />
        </KpiSummaryRow>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="MRR trend ($k)"><MrrTrendChart /></Card>
          <Card title="MRR share — live"><MrrShareDonut accounts={visibleAccounts} /></Card>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
          <Card
            title="Revenue movement ($k)"
            actions={
              <div className="flex flex-wrap items-center justify-end gap-3">
                <label className="micro flex items-center gap-2 text-muted">
                  <span>Bar width</span>
                  <input
                    type="range"
                    min={REVENUE_MOVEMENT_BAR_WIDTH_RANGE.min}
                    max={REVENUE_MOVEMENT_BAR_WIDTH_RANGE.max}
                    step={REVENUE_MOVEMENT_BAR_WIDTH_RANGE.step}
                    value={movementBarWidth}
                    aria-label="Revenue movement bar width"
                    className="h-8 w-24 accent-accent"
                    onChange={(event) => setMovementBarWidth(Number(event.target.value))}
                  />
                  <span className="num w-8 text-right text-[12px] text-muted">{movementBarWidth}px</span>
                </label>
                <Switch
                  label={<span className="micro text-muted">Labels</span>}
                  checked={movementLabels}
                  onChange={(event) => setMovementLabels(event.target.checked)}
                />
              </div>
            }
          >
            <RevenueMovementChart barWidth={movementBarWidth} showLabels={movementLabels} />
          </Card>
          <Card title="MRR bridge ($k)">
            <WaterfallChart
              data={revenueWaterfallSeries}
              ariaLabel="MRR bridge in thousands"
              valueFormatter={formatCurrencyK}
              tickFormatter={formatCompactKValue}
            />
          </Card>
        </div>

        <div className="mb-2 flex items-center justify-between gap-3 border border-line bg-surface px-3 py-2">
          <Switch
            label={<span className="micro text-muted">Server mode</span>}
            checked={serverMode}
            onChange={(event) => setServerMode(event.target.checked)}
          />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="primary" onClick={() => setCreating(true)}>+ New account</Button>
          </div>
          {serverMode && (
            <span className="num text-[12px] text-muted">
              {server.status === 'loading' ? 'Loading server rows...' : `${server.totalRowCount} server rows`}
            </span>
          )}
        </div>
        <DataGrid
          rows={serverMode ? server.rows : visibleAccounts}
          columns={gridColumns}
          getRowId={(row) => row.id}
          initialState={gridInitialState}
          enablePagination={!generatedAccounts}
          enableExport
          persistenceKey={generatedAccounts ? undefined : 'ledger.accounts.grid'}
          globalFilterFn={accountGlobalFilter}
          manualSorting={serverMode}
          manualFiltering={serverMode}
          manualPagination={serverMode}
          enableHeaderFilters
          enableRowSelection
          totalRowCount={serverMode ? server.totalRowCount : undefined}
          onQueryChange={serverMode ? setServerQuery : undefined}
          loading={serverMode && server.status === 'loading'}
          error={serverMode && server.status === 'error' ? server.error : undefined}
        />
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
    </>
  )
}

export default function App() {
  const { mode, toggle } = useTheme()
  const toast = useToast()
  const pathname = window.location.pathname
  const docsActive = pathname === '/docs' || pathname === '/examples'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [atRiskOnly, setAtRiskOnly] = useState(false)
  const [timePeriod, setTimePeriod] = useState(timePeriodOptions[1].value)
  const timePeriodLabel = timePeriodOptions.find((option) => option.value === timePeriod)?.label ?? timePeriodOptions[1].label

  const sidebar = (
    <LeftNavigationDrawer
      brand="Ledger"
      brandMark="#"
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      items={[
        { label: 'Overview', href: '/', active: !docsActive },
        { label: 'Components', href: '/docs', active: docsActive, meta: 'kit' },
        { label: 'Reports', href: '/', active: false },
      ]}
      adminItems={[
        { label: 'Users', href: '/', active: false },
        { label: 'Settings', href: '/', active: false },
      ]}
      footer={<span className="num text-[12px] text-muted">demo · v1.0</span>}
    />
  )

  const topNav = (
    <TopNav
      breadcrumbs={[
        { label: 'Ledger', href: '/' },
        { label: docsActive ? 'Components' : 'Accounts' },
      ]}
      title={docsActive ? 'Component catalog' : 'Accounts'}
      actions={
        <>
          <GlobalSearchInput
            className="w-[190px]"
            placeholder="Search workspace"
            aria-label="Global search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
          />
          <TimePeriodSelector
            value={timePeriod}
            options={timePeriodOptions}
            onChange={setTimePeriod}
          />
          <CalendarIconButton label="Open calendar" onClick={() => toast('Calendar controls are ready', 'accent')} />
          <FilterButton label="Risks" pressed={atRiskOnly} onClick={() => setAtRiskOnly((value) => !value)} />
          <NotificationButton count={3} onClick={() => toast('3 revenue alerts', 'warn')} />
          <Button onClick={toggle}>{mode === 'dark' ? 'Light' : 'Dark'}</Button>
          <UserAvatarMenu
            name="Morgan"
            initials="MO"
            meta="Demo workspace"
            items={[
              { id: 'profile', label: 'Profile', description: 'Morgan Operator', onSelect: () => toast('Profile opened', 'accent') },
              { id: 'workspace', label: 'Workspace', description: 'Demo workspace', onSelect: () => toast('Workspace opened', 'accent') },
              { id: 'sign-out', label: 'Sign out', onSelect: () => toast('Signed out of demo', 'warn') },
            ]}
          />
        </>
      }
    />
  )

  return (
    <AppShell sidebar={sidebar} topNav={topNav}>
      {docsActive ? (
        <DocsPage />
      ) : (
        <DashboardPage globalSearch={globalSearch} atRiskOnly={atRiskOnly} timePeriodLabel={timePeriodLabel} />
      )}
    </AppShell>
  )
}
