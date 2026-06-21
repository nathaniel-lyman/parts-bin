import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAccounts, type NewAccount } from './hooks/useAccounts'
import { useTheme } from './hooks/useTheme'
import { useServerData } from './hooks/useServerData'
import { totalMrr, activeCount, atRiskCount, avgGrowth, segmentShares } from './selectors/metrics'
import { fmtCurrency, fmtDelta, fmtPercent, formatCompactKValue, formatCurrencyK } from './lib/format'
import { KpiCard, KpiSummaryRow } from './components/KpiCard'
import {
  DataGrid,
  toGridQuery,
  type DataGridColumn,
  type DataGridContextSnapshot,
  type GridQuery,
} from './components/DataGrid'
import { AccountFormModal } from './components/AccountFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import {
  LineTrendChart,
  ShareDonutChart,
  SignedMovementChart,
  WaterfallChart,
  ChartCard,
  buildWaterfallData,
  DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH,
  REVENUE_MOVEMENT_BAR_WIDTH_RANGE,
} from './components/charts'
import {
  addDays,
  Button,
  CommandPalette,
  DateRangePicker,
  formatDateRangeLabel,
  IconButton,
  PageHeader,
  StatusBadge,
  Switch,
  Table,
  useToast,
  type CommandPaletteGroup,
  type DateRange,
  type TableColumn,
} from './components/ui'
import {
  AssistantPanel,
  buildAssistantDashboardEvidence,
  contextualAssistantSuggestions,
  createDemoAdapter,
  useChat,
  type AssistantDashboardEvidence,
  type AssistantActions,
  type AssistantGridContext,
  type AssistantRouteKind,
  type AssistantScreenContext,
} from './components/chat'
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
import { LoginPage, SettingsPage } from './components/templates'
import { monthlySeries, movementSeries, revenueWaterfallSeries, sparks } from './data/accounts'
import { createMockServerAdapter, generateAccounts } from './data/examples/accountMockServerAdapter'
import type { Account } from './data/types'
import { ACCOUNT_GRID_INITIAL_STATE, accountGlobalFilter, accountGridColumns, statusTone } from './components/accountGridColumns'
import { appHref, appPath, navigate } from './lib/routes'

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

function filterValueLabel(value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(filterValueLabel).filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function commandSavedViewName(grid: AssistantGridContext | undefined): string {
  if (!grid) return 'Current grid'
  const bits: string[] = []
  if (grid.atRiskOnly) bits.push('Review focus')
  if (grid.quickFilter.trim()) bits.push(`Quick filter ${grid.quickFilter.trim()}`)
  if (grid.globalSearch.trim()) bits.push(`Search ${grid.globalSearch.trim()}`)
  return bits.length ? bits.join(' - ') : 'Current grid'
}

function wideAccountGridColumns(columns: DataGridColumn<Account>[]): DataGridColumn<Account>[] {
  const actions = columns.find((column) => column.id === 'actions')
  const base = columns.filter((column) => column.id !== 'actions')
  const wide: DataGridColumn<Account>[] = Array.from({ length: 24 }, (_, index) => ({
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

function formatSignedCurrencyK(value: number) {
  if (value === 0) return formatCurrencyK(0)
  return `${value > 0 ? '+' : '-'}${formatCurrencyK(Math.abs(value))}`
}

function rowTotal(row: Record<string, unknown>, keys: readonly string[]) {
  return keys.reduce((sum, key) => {
    const value = row[key]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)
}

const trendInsight = (() => {
  const series = ['Enterprise', 'Mid-market', 'Startup'] as const
  const first = monthlySeries[0] as unknown as Record<string, unknown>
  const last = monthlySeries[monthlySeries.length - 1] as unknown as Record<string, unknown>
  const lift = rowTotal(last, series) - rowTotal(first, series)
  return {
    title: 'Line chart example: segmented trend',
    metric: formatSignedCurrencyK(lift),
    description: 'LineTrendChart in a ChartCard with sample rows; replace `data`, `series`, and `xKey` for your domain.',
  }
})()

const movementInsight = (() => {
  const totalNet = movementSeries.reduce((sum, row) => sum + row.New + row.Expansion + row.Churn, 0)
  return {
    title: 'Stacked bar example: signed movement',
    metric: formatSignedCurrencyK(totalNet),
    description: 'SignedMovementChart with adjustable bar width and labels; sample rows show positive and negative movement.',
  }
})()

const waterfallInsight = (() => {
  const { summary } = buildWaterfallData(revenueWaterfallSeries)
  return {
    title: 'Waterfall example: start to net bridge',
    metric: formatCurrencyK(summary.end),
    description: `WaterfallChart turns sequential deltas into a bridge; this sample offsets ${formatCurrencyK(summary.decrease)} in deductions.`,
  }
})()

// Read-only column set for the assembly demo's static accounts Table. Mirrors
// the DataGrid example's default visible columns, minus the interactive bits.
const accountTableColumns: TableColumn<Account>[] = [
  { key: 'name', header: 'Account', render: (row) => <span className="text-ink">{row.name}</span> },
  { key: 'owner', header: 'Owner', render: (row) => <span className="text-muted">{row.owner}</span> },
  { key: 'segment', header: 'Segment', render: (row) => <span className="text-muted">{row.segment}</span> },
  { key: 'mrr', header: 'Value', numeric: true, render: (row) => fmtCurrency(row.mrr) },
  {
    key: 'growth',
    header: 'Growth',
    numeric: true,
    render: (row) => <span className={row.growth < 0 ? 'text-neg' : 'text-pos'}>{fmtDelta(row.growth)}</span>,
  },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} tone={statusTone(row.status)} /> },
]

interface DashboardPageProps {
  accountsApi: ReturnType<typeof useAccounts>
  globalSearch: string
  atRiskOnly: boolean
  timePeriodLabel: string
  onAssistantDashboardEvidenceChange?: (evidence: AssistantDashboardEvidence) => void
}

function DashboardPage({
  accountsApi,
  globalSearch,
  atRiskOnly,
  timePeriodLabel,
  onAssistantDashboardEvidenceChange,
}: DashboardPageProps) {
  const { accounts } = accountsApi
  const visibleAccounts = useMemo(() => {
    let next = accounts
    const query = globalSearch.trim()
    if (query) next = next.filter((account) => accountGlobalFilter(account, query))
    if (atRiskOnly) next = next.filter((account) => account.status !== 'Active')
    return next
  }, [accounts, atRiskOnly, globalSearch])
  const shareInsight = useMemo(() => {
    const shares = segmentShares(visibleAccounts)
    const total = shares.reduce((sum, share) => sum + share.value, 0)
    if (total <= 0) {
      return {
        title: 'Donut example: share breakdown',
        metric: fmtCurrency(0),
        description: 'ShareDonutChart reads the visible sample rows; replace the data pipeline when copying.',
      }
    }
    const leader = shares.reduce((best, share) => (share.value > best.value ? share : best))
    return {
      title: 'Donut example: share breakdown',
      metric: fmtCurrency(leader.value),
      description: `${leader.segment} leads this sample slice. ShareDonutChart reads visible rows and excludes archived sample rows.`,
    }
  }, [visibleAccounts])
  const shareRows = useMemo(() => segmentShares(visibleAccounts).map((share) => ({
    id: share.segment,
    label: share.segment,
    value: share.value,
  })), [visibleAccounts])

  const [movementBarWidth, setMovementBarWidth] = useState(DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH)
  const [movementLabels, setMovementLabels] = useState(true)
  const [waterfallLabels, setWaterfallLabels] = useState(true)
  const dashboardEvidence = useMemo(() => buildAssistantDashboardEvidence({
    revenueMovementData: movementSeries,
    sourceTitle: 'Signed movement ($k)',
    timePeriodLabel,
    barWidth: movementBarWidth,
    labelsVisible: movementLabels,
  }), [movementBarWidth, movementLabels, timePeriodLabel])
  const dashboardEvidenceReportKey = useMemo(() => JSON.stringify(dashboardEvidence), [dashboardEvidence])
  const lastDashboardEvidenceReportKeyRef = useRef('')
  useLayoutEffect(() => {
    if (dashboardEvidenceReportKey === lastDashboardEvidenceReportKeyRef.current) return
    lastDashboardEvidenceReportKeyRef.current = dashboardEvidenceReportKey
    onAssistantDashboardEvidenceChange?.(dashboardEvidence)
  }, [dashboardEvidence, dashboardEvidenceReportKey, onAssistantDashboardEvidenceChange])

  return (
    <>
      <main className="w-full px-6 py-6">
        <PageHeader
          eyebrow="parts-bin component assembly"
          title="Component assembly demo"
          description={`A working sample assembled from parts-bin components: KpiCard, ChartCard, Table, and AssistantPanel. ${timePeriodLabel}${atRiskOnly ? ' · Review focus' : ''}${globalSearch.trim() ? ` · Search: ${globalSearch.trim()}` : ''}`}
          actions={
            <span className="num text-[13px] text-muted">
              {activeCount(visibleAccounts) + atRiskCount(visibleAccounts)} rows · {fmtCurrency(totalMrr(visibleAccounts))} sample value
            </span>
          }
        />

        <KpiSummaryRow>
          <KpiCard label="Total value" value={fmtCurrency(totalMrr(visibleAccounts))} delta={4.6} spark={sparks.mrr} />
          <KpiCard label="Active rows" value={String(activeCount(visibleAccounts))} delta={2.4} spark={sparks.accts} />
          <KpiCard label="Avg change" value={fmtPercent(avgGrowth(visibleAccounts))} delta={1.1} spark={sparks.growth} />
          <KpiCard label="Needs review" value={String(atRiskCount(visibleAccounts))} delta={-12.5} spark={sparks.churn} negSpark />
        </KpiSummaryRow>

        <section aria-labelledby="chart-examples-title" className="mb-3 grid gap-1">
          <h2 id="chart-examples-title" className="m-0 text-[15px] font-semibold text-ink">Reusable chart examples</h2>
          <p className="m-0 text-[13px] text-muted">
            These panels demonstrate the chart exports in <code className="num text-ink">src/components/charts</code> using generic sample records.
          </p>
        </section>
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title={trendInsight.title}
            description={trendInsight.description}
            metric={trendInsight.metric}
          >
            <LineTrendChart showEndLabels />
          </ChartCard>
          <ChartCard
            title={shareInsight.title}
            description={shareInsight.description}
            metric={shareInsight.metric}
          >
            <ShareDonutChart data={shareRows} totalLabel="Active value" valueFormatter={fmtCurrency} />
          </ChartCard>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
          <ChartCard
            title={movementInsight.title}
            description={movementInsight.description}
            metric={movementInsight.metric}
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
                    aria-label="Signed movement bar width"
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
            <SignedMovementChart data={movementSeries} barWidth={movementBarWidth} showLabels={movementLabels} />
          </ChartCard>
          <ChartCard
            title={waterfallInsight.title}
            description={waterfallInsight.description}
            metric={waterfallInsight.metric}
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
              ariaLabel="Sample bridge in thousands"
              showLabels={waterfallLabels}
              valueFormatter={formatCurrencyK}
              tickFormatter={formatCompactKValue}
            />
          </ChartCard>
        </div>

        <section aria-labelledby="accounts-table-title" className="mb-3 grid gap-1">
          <h2 id="accounts-table-title" className="m-0 text-[15px] font-semibold text-ink">Sample accounts</h2>
          <p className="m-0 text-[13px] text-muted">
            A read-only <code className="num text-ink">Table</code> of the visible sample rows. For sorting, filtering, column tools, selection, inline edit, and export, open the{' '}
            <a className="text-accent hover:underline" href={appHref('/examples/datagrid')}>DataGrid example</a>.
          </p>
        </section>
        <div data-testid="accounts-table" className="overflow-x-auto border border-line bg-surface px-3 py-1">
          <Table
            caption="Sample accounts"
            columns={accountTableColumns}
            rows={visibleAccounts}
            rowKey={(row) => row.id}
            emptyMessage="No rows match the current filters"
          />
        </div>
      </main>
    </>
  )
}

interface DataGridExamplePageProps {
  accountsApi: ReturnType<typeof useAccounts>
  globalSearch: string
  atRiskOnly: boolean
  timePeriodLabel: string
  onAssistantGridContextChange?: (
    context: AssistantGridContext,
    actions: DataGridContextSnapshot<Account>['actions'],
  ) => void
}

function DataGridExamplePage({
  accountsApi,
  globalSearch,
  atRiskOnly,
  timePeriodLabel,
  onAssistantGridContextChange,
}: DataGridExamplePageProps) {
  const { accounts, create, update, remove } = accountsApi
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
    () => (generatedAccounts ? { ...ACCOUNT_GRID_INITIAL_STATE, sorting: [] } : ACCOUNT_GRID_INITIAL_STATE),
    [generatedAccounts],
  )

  const [editing, setEditing] = useState<Account | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const [serverMode, setServerMode] = useState(params.get('server') === '1')
  const [serverQuery, setServerQuery] = useState<GridQuery>(() => toGridQuery(ACCOUNT_GRID_INITIAL_STATE))
  const serverAdapter = useMemo(() => createMockServerAdapter(visibleAccounts, { latencyMs: 80 }), [visibleAccounts])
  const server = useServerData(serverAdapter, serverQuery, { enabled: serverMode, debounceMs: 120 })
  const gridColumns = useMemo(() => {
    const columns = accountGridColumns({ onEdit: setEditing, onDelete: setDeleting })
    return wideColumns ? wideAccountGridColumns(columns) : columns
  }, [setDeleting, setEditing, wideColumns])
  const handleAssistantGridContextChange = useCallback(
    (snapshot: DataGridContextSnapshot<Account>) => {
      onAssistantGridContextChange?.({
        visibleAccounts: snapshot.visibleRows,
        selectedAccounts: snapshot.selectedRows,
        totalRowCount: snapshot.totalRowCount,
        visibleRowCount: snapshot.visibleRowCount,
        selectedRowCount: snapshot.selectedRowCount,
        globalSearch,
        quickFilter: snapshot.globalFilter,
        atRiskOnly,
        timePeriodLabel,
        columnFilters: snapshot.columnFilters.map((filter) => ({
          id: filter.id,
          value: filterValueLabel(filter.value),
        })),
        sorting: snapshot.sorting.map((sort) => ({ id: sort.id, desc: sort.desc })),
        savedViews: snapshot.savedViews,
        currentSavedViewName: snapshot.currentSavedView?.name,
      }, snapshot.actions)
    },
    [atRiskOnly, globalSearch, onAssistantGridContextChange, timePeriodLabel],
  )

  return (
    <>
      <main className="w-full px-6 py-6">
        <PageHeader
          eyebrow="parts-bin component assembly"
          title="DataGrid example"
          description={`The full DataGrid harness: sorting, filtering, column tools, selection, inline edit, grouping, export, and an optional mock server mode. ${timePeriodLabel}${atRiskOnly ? ' · Review focus' : ''}${globalSearch.trim() ? ` · Search: ${globalSearch.trim()}` : ''}`}
          actions={
            <span className="num text-[13px] text-muted">{visibleAccounts.length} rows</span>
          }
        />

        <div className="mb-2 flex items-center justify-between gap-3 border border-line bg-surface px-3 py-2">
          <Switch
            label={<span className="micro text-muted">Server mode</span>}
            checked={serverMode}
            onChange={(event) => setServerMode(event.target.checked)}
          />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="primary" onClick={() => setCreating(true)}>+ New row</Button>
          </div>
          {serverMode && (
            <span className="num text-[12px] text-muted">
              {server.status === 'loading' ? 'Loading server rows...' : `${server.totalRowCount} server rows`}
            </span>
          )}
        </div>
        <div data-testid="accounts-grid">
          <DataGrid
            rows={serverMode ? server.rows : visibleAccounts}
            columns={gridColumns}
            getRowId={(row) => row.id}
            initialState={gridInitialState}
            enablePagination={!generatedAccounts}
            enableExport
            enableExcelExport
            persistenceKey={generatedAccounts ? undefined : 'ledger.accounts.grid'}
            globalFilterFn={accountGlobalFilter}
            manualSorting={serverMode}
            manualFiltering={serverMode}
            manualPagination={serverMode}
            enableRowSelection
            totalRowCount={serverMode ? server.totalRowCount : undefined}
            onQueryChange={serverMode ? setServerQuery : undefined}
            loading={serverMode && server.status === 'loading'}
            error={serverMode && server.status === 'error' ? server.error : undefined}
            onContextChange={handleAssistantGridContextChange}
            enableGrouping={!serverMode}
            onRowUpdate={serverMode ? undefined : (id, patch, row) => {
              // The demo's derived annualized value stays in sync when its base value is edited inline.
              const next = patch.mrr !== undefined ? { ...patch, arr: Number(patch.mrr) * 12 } : patch
              update(id, next)
              toast(`Saved ${row.name}`, 'accent')
            }}
          />
        </div>
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
          title="Delete row"
          message={`Delete ${deleting.name}? This removes ${fmtCurrency(deleting.mrr)} of sample value and its history.`}
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
  // Shared instance for the assembly demo AND the assistant adapter, so the demo
  // answers track live CRUD edits.
  const accountsApi = useAccounts()
  const accountsRef = useRef(accountsApi.accounts)
  useLayoutEffect(() => { accountsRef.current = accountsApi.accounts })
  const [assistantOpen, setAssistantOpen] = useState(false)
  const assistantGridContextRef = useRef<AssistantGridContext | undefined>(undefined)
  const assistantDashboardEvidenceRef = useRef<AssistantDashboardEvidence | undefined>(undefined)
  const gridAssistantActionsRef = useRef<DataGridContextSnapshot<Account>['actions'] | null>(null)
  const pathname = appPath()
  const loginActive = pathname === '/login'
  const settingsActive = pathname === '/settings'
  const docsActive = pathname === '/' || pathname === '/docs'
  const assemblyActive = pathname === '/examples/dashboard' || pathname === '/demo'
  const gridExampleActive = pathname === '/examples/datagrid'
  const kitActive = docsActive
  const accountsActive = assemblyActive || gridExampleActive
  const routeKind: AssistantRouteKind = settingsActive
    ? 'settings'
    : docsActive
      ? 'components'
      : accountsActive
        ? 'accounts'
        : 'unknown'
  const routeLabel = settingsActive
    ? 'Settings'
    : docsActive
      ? 'Component catalog'
      : gridExampleActive
        ? 'DataGrid example'
        : 'Component assembly'
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
  const handleAssistantGridContextChange = useCallback((
    context: AssistantGridContext,
    actions: DataGridContextSnapshot<Account>['actions'],
  ) => {
    gridAssistantActionsRef.current = actions
    assistantGridContextRef.current = context
  }, [])
  const handleAssistantDashboardEvidenceChange = useCallback((evidence: AssistantDashboardEvidence) => {
    assistantDashboardEvidenceRef.current = evidence
  }, [])
  const assistantShellContext = useMemo<AssistantScreenContext>(() => ({
    route: pathname,
    routeLabel,
    routeKind,
    activeTemplate: undefined,
    globalSearch,
    atRiskOnly,
    timePeriodLabel: dashboardPeriodLabel,
  }), [
    atRiskOnly,
    dashboardPeriodLabel,
    globalSearch,
    pathname,
    routeKind,
    routeLabel,
  ])
  const assistantShellContextRef = useRef(assistantShellContext)
  useLayoutEffect(() => { assistantShellContextRef.current = assistantShellContext })
  const assistantActions = useMemo<AssistantActions>(() => ({
    createSavedView: (name) => {
      const trimmedName = name.trim() || 'Assistant view'
      const viewId = gridAssistantActionsRef.current?.saveCurrentView(trimmedName)
      if (!viewId) {
        return {
          title: 'No grid view saved',
          body: 'Open the sample grid first so I can save its current filters, columns, sort, density, and page size.',
        }
      }
      toast(`Saved view ${trimmedName}`, 'pos')
      return {
        title: 'Saved view created',
        body: `Saved **${trimmedName}** from the current sample grid. You can apply it from the grid Views menu.`,
      }
    },
  }), [toast])
  const assistantSuggestions = useMemo(
    () => contextualAssistantSuggestions(assistantShellContext),
    [assistantShellContext],
  )
  // getAccounts/getContext read refs only when the adapter's send() runs
  // asynchronously. The disable-next-line suppresses the react-hooks/refs
  // false-positive for passing ref-reading getters through useMemo.
  // eslint-disable-next-line react-hooks/refs
  const assistantAdapter = useMemo(() => createDemoAdapter(() => accountsRef.current, {
    getContext: () => {
      const shell = assistantShellContextRef.current
      const onGridExample = shell.route === '/examples/datagrid'
      const onAssembly = shell.route === '/examples/dashboard' || shell.route === '/demo'
      return {
        ...shell,
        grid: onGridExample ? assistantGridContextRef.current : undefined,
        dashboardEvidence: onAssembly ? assistantDashboardEvidenceRef.current : undefined,
      }
    },
    actions: assistantActions,
  }), [assistantActions])
  const assistantChat = useChat(assistantAdapter)
  const { send: sendAssistantMessage, status: assistantStatus } = assistantChat
  const assistantBusy = assistantStatus === 'streaming'
  const sendAssistantCommand = useCallback((prompt: string) => {
    setAssistantOpen(true)
    sendAssistantMessage(prompt)
  }, [sendAssistantMessage])
  const saveCurrentGridView = useCallback(() => {
    if (!gridExampleActive || !gridAssistantActionsRef.current) {
      toast('Open the DataGrid example before saving a view', 'warn')
      return
    }
    const name = commandSavedViewName(assistantGridContextRef.current)
    gridAssistantActionsRef.current.saveCurrentView(name)
    toast(`Saved view ${name}`, 'pos')
  }, [gridExampleActive, toast])
  const resetAccountGridView = useCallback(() => {
    if (!gridExampleActive || !gridAssistantActionsRef.current) {
      toast('Open the DataGrid example before resetting the view', 'warn')
      return
    }
    gridAssistantActionsRef.current.resetView()
    toast('Reset sample grid layout', 'accent')
  }, [gridExampleActive, toast])
  const clearSelectedGridRows = useCallback(() => {
    if (!gridExampleActive || !gridAssistantActionsRef.current) {
      toast('Open the DataGrid example before clearing selection', 'warn')
      return
    }
    const selected = assistantGridContextRef.current?.selectedRowCount ?? 0
    if (selected === 0) {
      toast('No selected rows to clear', 'warn')
      return
    }
    gridAssistantActionsRef.current.clearSelection()
    toast(selected === 1 ? 'Cleared 1 selected row' : `Cleared ${selected} selected rows`, 'accent')
  }, [gridExampleActive, toast])
  const clearWorkspaceFilters = useCallback(() => {
    setGlobalSearch('')
    setAtRiskOnly(false)
    toast('Cleared workspace filters', 'accent')
  }, [toast])
  const handleTimePeriodChange = useCallback((nextPeriod: string) => {
    setTimePeriod(nextPeriod)
    const preset = dateRangePresets.find((option) => option.id === nextPeriod)
    if (preset) setDateRange(preset.range)
  }, [dateRangePresets])
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
          id: 'components',
          label: 'Open component catalog',
          description: 'Primary parts-bin design-system reference',
          shortcut: 'G C',
          onSelect: () => { navigate('/docs') },
        },
        {
          id: 'assembly',
          label: 'Open component assembly',
          description: 'Example assembly of KPI, chart, table, and assistant components',
          shortcut: 'G D',
          onSelect: () => { navigate('/examples/dashboard') },
        },
        {
          id: 'datagrid',
          label: 'Open DataGrid example',
          description: 'Full DataGrid harness with server mode, selection, and CRUD',
          shortcut: 'G G',
          onSelect: () => { navigate('/examples/datagrid') },
        },
        {
          id: 'settings',
          label: 'Open settings',
          description: 'Appearance, profile, and notifications',
          shortcut: 'G S',
          onSelect: () => { navigate('/settings') },
        },
        {
          id: 'sign-out',
          label: 'Sign out',
          description: 'Return to the sign-in screen',
          onSelect: () => { navigate('/login') },
        },
      ],
    },
    {
      id: 'assistant',
      label: 'Assistant',
      items: [
        {
          id: 'assistant-screen-summary',
          label: 'Summarize current screen',
          description: assistantBusy ? 'Assistant is already responding' : `Ask about ${routeLabel}`,
          shortcut: 'S',
          disabled: assistantBusy,
          keywords: ['assistant', 'context', 'where am i'],
          onSelect: () => sendAssistantCommand('Summarize the current screen'),
        },
        {
          id: 'assistant-signed-movement',
          label: 'Explain signed movement',
          description: assistantBusy ? 'Assistant is already responding' : 'Ask from the current visible row scope',
          shortcut: 'M',
          disabled: assistantBusy,
          keywords: ['assistant', 'bridge', 'movement'],
          onSelect: () => sendAssistantCommand('Explain this signed movement'),
        },
        {
          id: 'assistant-selected-rows',
          label: 'Summarize selected rows',
          description: assistantBusy ? 'Assistant is already responding' : 'Uses the current grid selection',
          shortcut: 'X',
          disabled: assistantBusy,
          keywords: ['assistant', 'selected', 'rows'],
          onSelect: () => sendAssistantCommand('Summarize selected rows'),
        },
      ],
    },
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        {
          id: 'risk-focus',
          label: atRiskOnly ? 'Show all rows' : 'Show review focus',
          description: 'Toggle rows that need review',
          shortcut: 'R',
          onSelect: () => setAtRiskOnly((value) => !value),
        },
        {
          id: 'clear-workspace-filters',
          label: 'Clear workspace filters',
          description: globalSearch.trim() || atRiskOnly ? 'Clear search and review focus' : 'Search and review focus are already clear',
          shortcut: 'C F',
          onSelect: clearWorkspaceFilters,
        },
        {
          id: 'theme',
          label: mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
          description: 'Toggle the parts-bin color mode',
          shortcut: 'T',
          onSelect: toggle,
        },
        {
          id: 'alerts',
          label: 'Show review alerts',
          description: 'Preview the current notification state',
          shortcut: 'N',
          onSelect: () => toast('3 review alerts', 'warn'),
        },
        {
          id: 'assistant',
          label: 'Ask the assistant',
          description: 'Open the AI assistant panel',
          shortcut: 'A',
          onSelect: () => setAssistantOpen(true),
        },
      ],
    },
    {
      id: 'sample-grid',
      label: 'DataGrid example',
      items: [
        {
          id: 'save-grid-view',
          label: 'Save current grid view',
          description: gridExampleActive ? 'Persist filters, columns, sort, density, and page size' : 'Available on the DataGrid example',
          shortcut: 'V S',
          disabled: !gridExampleActive,
          keywords: ['saved view', 'view', 'grid'],
          onSelect: saveCurrentGridView,
        },
        {
          id: 'reset-grid-view',
          label: 'Reset grid layout',
          description: gridExampleActive ? 'Restore the default sample grid layout' : 'Available on the DataGrid example',
          shortcut: 'V R',
          disabled: !gridExampleActive,
          keywords: ['view', 'columns', 'grid'],
          onSelect: resetAccountGridView,
        },
        {
          id: 'clear-grid-selection',
          label: 'Clear selected rows',
          description: gridExampleActive ? 'Deselect all selected rows' : 'Available on the DataGrid example',
          shortcut: 'V C',
          disabled: !gridExampleActive,
          keywords: ['selection', 'selected', 'rows'],
          onSelect: clearSelectedGridRows,
        },
      ],
    },
    {
      id: 'time-range',
      label: 'Time range',
      items: timePeriodOptions.map((option) => ({
        id: `period-${option.value}`,
        label: option.label,
        description: option.value === timePeriod ? 'Current reporting window' : 'Switch reporting window',
        shortcut: option.value === '7d' ? 'P 7' : option.value === '30d' ? 'P 3' : option.value === '90d' ? 'P 9' : 'P 1',
        keywords: ['period', 'date', 'range', option.label],
        onSelect: () => handleTimePeriodChange(option.value),
      })),
    },
  ], [
    assistantBusy,
    atRiskOnly,
    clearSelectedGridRows,
    clearWorkspaceFilters,
    globalSearch,
    gridExampleActive,
    handleTimePeriodChange,
    mode,
    resetAccountGridView,
    routeLabel,
    saveCurrentGridView,
    sendAssistantCommand,
    timePeriod,
    toast,
    toggle,
  ])

  // Login is the only pre-auth surface: full-bleed, no sidebar/topnav. Returned
  // before the AppShell below — placed after all hooks to respect rules-of-hooks.
  if (loginActive) return <LoginPage />

  const sidebar = (
    <LeftNavigationDrawer
      brand="parts-bin"
      brandHref={appHref('/docs')}
      brandMark="pk"
      collapsed={sidebarCollapsed}
      onCollapsedChange={setSidebarCollapsed}
      items={[
        { label: 'Components', href: appHref('/docs'), active: docsActive, meta: 'kit' },
        { label: 'Assembly demo', href: appHref('/examples/dashboard'), active: assemblyActive, meta: 'demo' },
        { label: 'DataGrid example', href: appHref('/examples/datagrid'), active: gridExampleActive, meta: 'demo' },
      ]}
      adminItems={[
        { label: 'Settings', href: appHref('/settings'), active: settingsActive },
      ]}
      footer={<span className="num text-[12px] text-muted">component demo · v1.0</span>}
    />
  )

  const topNav = (
    <TopNav
      breadcrumbs={[
        { label: 'parts-bin', href: appHref('/docs') },
        { label: routeLabel },
      ]}
      title={routeLabel}
      actions={
        <>
          <GlobalSearchInput
            className="hidden w-[190px] xl:block"
            placeholder={docsActive ? 'Search components' : 'Search workspace'}
            aria-label="Global search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
          />
          {!kitActive && !settingsActive && (
            <>
              {/* Secondary controls collapse on narrow viewports so the bar
                  stays one row; everything hidden here remains reachable via
                  the command palette. Widest + most redundant hides first. */}
              <div className="hidden xl:block">
                <TimePeriodSelector
                  value={timePeriod}
                  options={selectableTimePeriodOptions}
                  onChange={handleTimePeriodChange}
                />
              </div>
              <div className="hidden 2xl:block">
                <DateRangePicker
                  label="Dates"
                  value={dateRange}
                  onValueChange={handleDateRangeChange}
                  presets={dateRangePresets}
                />
              </div>
              <div className="hidden 2xl:block">
                <FilterButton label="Review" pressed={atRiskOnly} onClick={() => setAtRiskOnly((value) => !value)} />
              </div>
              <NotificationButton count={3} onClick={() => toast('3 review alerts', 'warn')} />
            </>
          )}
          <IconButton aria-label="Open assistant" onClick={() => setAssistantOpen(true)}>✦</IconButton>
          <CommandPalette
            groups={commandGroups}
            enableGlobalShortcuts
            trigger={(
              <>
                <span className="sr-only">Command</span>
                <span aria-hidden="true" className="sm:hidden">Cmd</span>
                <span aria-hidden="true" className="hidden sm:inline">Command</span>
              </>
            )}
          />
          <Button onClick={toggle}>{mode === 'dark' ? 'Light' : 'Dark'}</Button>
          <UserAvatarMenu
            name="Morgan"
            initials="MO"
            meta="Demo workspace"
            items={[
              { id: 'profile', label: 'Profile', description: 'Morgan Operator', onSelect: () => toast('Profile opened', 'accent') },
              { id: 'settings', label: 'Settings', description: 'Workspace settings', onSelect: () => { navigate('/settings') } },
              { id: 'sign-out', label: 'Sign out', onSelect: () => { navigate('/login') } },
            ]}
          />
        </>
      }
    />
  )

  return (
    <AppShell sidebar={sidebar} topNav={topNav}>
      {settingsActive ? (
        <SettingsPage />
      ) : docsActive ? (
        <DocsPage globalSearch={globalSearch} />
      ) : gridExampleActive ? (
        <DataGridExamplePage
          accountsApi={accountsApi}
          globalSearch={globalSearch}
          atRiskOnly={atRiskOnly}
          timePeriodLabel={dashboardPeriodLabel}
          onAssistantGridContextChange={handleAssistantGridContextChange}
        />
      ) : assemblyActive ? (
        <DashboardPage
          accountsApi={accountsApi}
          globalSearch={globalSearch}
          atRiskOnly={atRiskOnly}
          timePeriodLabel={dashboardPeriodLabel}
          onAssistantDashboardEvidenceChange={handleAssistantDashboardEvidenceChange}
        />
      ) : (
        <DocsPage globalSearch={globalSearch} />
      )}
      {assistantOpen && (
        <AssistantPanel
          adapter={assistantAdapter}
          chat={assistantChat}
          suggestions={assistantSuggestions}
          onClose={() => setAssistantOpen(false)}
        />
      )}
    </AppShell>
  )
}
