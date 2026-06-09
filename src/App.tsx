import { useMemo, useState } from 'react'
import { useAccounts, type NewAccount } from './hooks/useAccounts'
import { useTheme } from './hooks/useTheme'
import { useServerData } from './hooks/useServerData'
import { totalMrr, activeCount, atRiskCount, avgGrowth } from './selectors/metrics'
import { fmtCurrency, fmtPercent } from './lib/format'
import { KpiCard, KpiSummaryRow } from './components/KpiCard'
import {
  DataGrid,
  createMockServerAdapter,
  generateAccounts,
  toGridQuery,
  DEFAULT_STATE,
  type GridQuery,
} from './components/DataGrid'
import { AccountFormModal } from './components/AccountFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import {
  MrrTrendChart,
  MrrShareDonut,
  RevenueMovementChart,
  WaterfallChart,
  DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH,
  REVENUE_MOVEMENT_BAR_WIDTH_RANGE,
} from './components/charts'
import {
  addDays,
  Button,
  Card,
  CommandPalette,
  DateRangePicker,
  formatDateRangeLabel,
  PageHeader,
  Switch,
  useToast,
  type CommandPaletteGroup,
  type DateRange,
} from './components/ui'
import {
  AppShell,
  FilterButton,
  GlobalSearchInput,
  LeftNavigationDrawer,
  NotificationButton,
  TimePeriodSelector,
  TopNav,
  UserAvatarMenu,
} from './components/shell'
import { DocsPage } from './components/docs/DocsPage'
import { CustomerSuccessTemplate, RecommendationReviewTemplate } from './components/templates'
import { revenueWaterfallSeries, sparks } from './data/accounts'
import type { Account } from './data/types'
import { accountGlobalFilter, accountGridColumns } from './components/accountGridColumns'
import type { LedgerGridColumn } from './components/DataGrid'

const timePeriodOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
]
const customTimePeriodOption = { value: 'custom', label: 'Custom range' }

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function makeTrailingRange(days: number): DateRange {
  const end = todayInputValue()
  return { start: addDays(end, -days + 1), end }
}

function dateRangesEqual(a: DateRange, b: DateRange) {
  return a.start === b.start && a.end === b.end
}

function formatCompactKValue(value: number) {
  const absolute = Math.abs(value)
  return absolute >= 10 || Number.isInteger(absolute) ? absolute.toFixed(0) : absolute.toFixed(1)
}

function formatCurrencyK(value: number) {
  return `${value < 0 ? '-' : ''}$${formatCompactKValue(value)}k`
}

function wideAccountGridColumns(columns: LedgerGridColumn<Account>[]): LedgerGridColumn<Account>[] {
  const actions = columns.find((column) => column.id === 'actions')
  const base = columns.filter((column) => column.id !== 'actions')
  const wide: LedgerGridColumn<Account>[] = Array.from({ length: 24 }, (_, index) => ({
    id: `wide-${index}`,
    header: `Metric ${index + 1}`,
    align: 'right',
    type: 'number',
    width: 132,
    minWidth: 112,
    accessorFn: (row) => {
      const rowNumber = Number(row.id.replace(/\D/g, '')) || 0
      return rowNumber * (index + 3)
    },
    cell: (ctx) => <span className="num text-muted">{Number(ctx.value).toLocaleString()}</span>,
  }))
  return actions ? [...base, ...wide, actions] : [...base, ...wide]
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
  const wideColumns = params.get('cols') === 'wide'
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
  const [waterfallLabels, setWaterfallLabels] = useState(false)
  const serverAdapter = useMemo(() => createMockServerAdapter(visibleAccounts, { latencyMs: 80 }), [visibleAccounts])
  const server = useServerData(serverAdapter, serverQuery, { enabled: serverMode, debounceMs: 120 })
  const gridColumns = useMemo(() => {
    const columns = accountGridColumns({ onEdit: setEditing, onDelete: setDeleting })
    return wideColumns ? wideAccountGridColumns(columns) : columns
  }, [setDeleting, setEditing, wideColumns])

  return (
    <>
      <main className="w-full px-6 py-6">
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
                  label={<span className="micro text-muted">Movement labels</span>}
                  checked={movementLabels}
                  onChange={(event) => setMovementLabels(event.target.checked)}
                />
              </div>
            }
          >
            <RevenueMovementChart barWidth={movementBarWidth} showLabels={movementLabels} />
          </Card>
          <Card
            title="MRR bridge ($k)"
            actions={
              <Switch
                label={<span className="micro text-muted">Bridge labels</span>}
                checked={waterfallLabels}
                onChange={(event) => setWaterfallLabels(event.target.checked)}
              />
            }
          >
            <WaterfallChart
              data={revenueWaterfallSeries}
              ariaLabel="MRR bridge in thousands"
              showLabels={waterfallLabels}
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
  const docsActive = pathname === '/docs'
  const customerTemplateActive = pathname === '/templates/customer-success' || pathname === '/examples'
  const recommendationTemplateActive = pathname === '/templates/recommendation-review'
  const templateActive = customerTemplateActive || recommendationTemplateActive
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [atRiskOnly, setAtRiskOnly] = useState(false)
  const [timePeriod, setTimePeriod] = useState('90d')
  const [dateRange, setDateRange] = useState<DateRange>(() => makeTrailingRange(90))
  const dateRangePresets = useMemo(() => [
    { id: '7d', label: 'Last 7 days', range: makeTrailingRange(7) },
    { id: '30d', label: 'Last 30 days', range: makeTrailingRange(30) },
    { id: '90d', label: 'Last 90 days', range: makeTrailingRange(90) },
    { id: '12m', label: 'Last 12 months', range: makeTrailingRange(365) },
  ], [])
  const selectableTimePeriodOptions = timePeriod === customTimePeriodOption.value
    ? [...timePeriodOptions, customTimePeriodOption]
    : timePeriodOptions
  const timePeriodLabel = [...timePeriodOptions, customTimePeriodOption].find((option) => option.value === timePeriod)?.label ?? customTimePeriodOption.label
  const dateRangeLabel = formatDateRangeLabel(dateRange)
  const dashboardPeriodLabel = dateRange.start || dateRange.end ? `${timePeriodLabel} · ${dateRangeLabel}` : timePeriodLabel
  const handleTimePeriodChange = (nextPeriod: string) => {
    setTimePeriod(nextPeriod)
    const preset = dateRangePresets.find((option) => option.id === nextPeriod)
    if (preset) setDateRange(preset.range)
  }
  const handleDateRangeChange = (nextRange: DateRange) => {
    setDateRange(nextRange)
    const matchingPreset = dateRangePresets.find((option) => dateRangesEqual(option.range, nextRange))
    setTimePeriod(matchingPreset?.id ?? customTimePeriodOption.value)
  }
  const commandGroups = useMemo<CommandPaletteGroup[]>(() => [
    {
      id: 'navigation',
      label: 'Navigation',
      items: [
        {
          id: 'dashboard',
          label: 'Open dashboard',
          description: 'Revenue account dashboard',
          shortcut: 'G D',
          onSelect: () => { window.location.href = '/' },
        },
        {
          id: 'components',
          label: 'Open component catalog',
          description: 'Live Ledger UI reference',
          shortcut: 'G C',
          onSelect: () => { window.location.href = '/docs' },
        },
        {
          id: 'template',
          label: 'Open customer success template',
          description: 'Customer operations workspace',
          shortcut: 'G T',
          onSelect: () => { window.location.href = '/templates/customer-success' },
        },
        {
          id: 'recommendation-review-template',
          label: 'Open recommendation review template',
          description: 'Queue, detail panel, and feedback workflow',
          shortcut: 'G R',
          onSelect: () => { window.location.href = '/templates/recommendation-review' },
        },
      ],
    },
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        {
          id: 'risk-focus',
          label: atRiskOnly ? 'Show all accounts' : 'Show risk focus',
          description: 'Toggle at-risk and churned account focus',
          shortcut: 'R',
          onSelect: () => setAtRiskOnly((value) => !value),
        },
        {
          id: 'theme',
          label: mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
          description: 'Toggle the Ledger color mode',
          shortcut: 'T',
          onSelect: toggle,
        },
        {
          id: 'alerts',
          label: 'Show revenue alerts',
          description: 'Preview the current notification state',
          onSelect: () => toast('3 revenue alerts', 'warn'),
        },
      ],
    },
  ], [atRiskOnly, mode, toast, toggle])

  const sidebar = (
    <LeftNavigationDrawer
      brand="Ledger"
      brandMark="#"
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      items={[
        { label: 'Accounts', href: '/', active: !docsActive && !templateActive },
        { label: 'Customer success', href: '/templates/customer-success', active: customerTemplateActive, meta: 'app' },
        { label: 'Review queue', href: '/templates/recommendation-review', active: recommendationTemplateActive, meta: 'app' },
        { label: 'Components', href: '/docs', active: docsActive, meta: 'kit' },
      ]}
      footer={<span className="num text-[12px] text-muted">demo · v1.0</span>}
    />
  )

  const topNav = (
    <TopNav
      breadcrumbs={[
        { label: 'Ledger', href: '/' },
        { label: docsActive ? 'Components' : recommendationTemplateActive ? 'Review queue' : customerTemplateActive ? 'Customer success' : 'Accounts' },
      ]}
      title={docsActive ? 'Component catalog' : recommendationTemplateActive ? 'Recommendation review' : customerTemplateActive ? 'Customer success' : 'Accounts'}
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
            options={selectableTimePeriodOptions}
            onChange={handleTimePeriodChange}
          />
          <DateRangePicker
            label="Dates"
            value={dateRange}
            onValueChange={handleDateRangeChange}
            presets={dateRangePresets}
          />
          <FilterButton label="Risks" pressed={atRiskOnly} onClick={() => setAtRiskOnly((value) => !value)} />
          <NotificationButton count={3} onClick={() => toast('3 revenue alerts', 'warn')} />
          <CommandPalette groups={commandGroups} />
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
      ) : customerTemplateActive ? (
        <CustomerSuccessTemplate
          globalSearch={globalSearch}
          atRiskOnly={atRiskOnly}
          timePeriodLabel={dashboardPeriodLabel}
        />
      ) : recommendationTemplateActive ? (
        <RecommendationReviewTemplate
          globalSearch={globalSearch}
          timePeriodLabel={dashboardPeriodLabel}
        />
      ) : (
        <DashboardPage globalSearch={globalSearch} atRiskOnly={atRiskOnly} timePeriodLabel={dashboardPeriodLabel} />
      )}
    </AppShell>
  )
}
