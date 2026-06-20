import { useEffect, useMemo, useRef, useState } from 'react'
import { accountGlobalFilter, accountGridColumns } from '../accountGridColumns'
import { DataGrid, DEFAULT_STATE } from '../DataGrid'
import { KpiCard, KpiSummaryRow } from '../KpiCard'
import {
  ActivityFeed,
  Button,
  Card,
  DescriptionList,
  DetailHeader,
  Drawer,
  Field,
  Input,
  MetadataPanel,
  PageHeader,
  Select,
  StatusBadge,
  Stepper,
  Switch,
  Textarea,
  Toolbar,
  useToast,
  type ActivityEvent,
} from '../ui'
import { FilterBar, SettingsPanel } from '../shell'
import { statusTone } from '../accountGridColumns'
import { fmtCurrency, fmtPercent } from '../../lib/format'
import { activeCount, atRiskCount, avgGrowth, totalMrr } from '../../selectors/metrics'
import { useAccounts } from '../../hooks/useAccounts'
import type { Account } from '../../data/types'

type WorkStage = 'Review' | 'Customer reply' | 'Approval' | 'Done'
type WorkPriority = 'High' | 'Medium' | 'Low'

interface WorkItem {
  id: string
  accountId: string
  title: string
  description: string
  stage: WorkStage
  priority: WorkPriority
  owner: string
  due: string
}

const workItems: WorkItem[] = [
  {
    id: 'renewal-cobalt',
    accountId: 'a1',
    title: 'Renewal risk review',
    description: 'Usage fell below the enterprise success threshold before Q3 renewal.',
    stage: 'Review',
    priority: 'High',
    owner: 'Avery Cohen',
    due: 'Today',
  },
  {
    id: 'expansion-lumen',
    accountId: 'a2',
    title: 'Expansion approval',
    description: 'Finance requested updated ARR terms before legal review.',
    stage: 'Approval',
    priority: 'Medium',
    owner: 'Blair Nakamura',
    due: 'Tomorrow',
  },
  {
    id: 'onboarding-nova',
    accountId: 'a5',
    title: 'Onboarding handoff',
    description: 'Confirm success criteria and executive sponsor before kickoff.',
    stage: 'Customer reply',
    priority: 'Medium',
    owner: 'Devin Okafor',
    due: 'Jun 12',
  },
  {
    id: 'save-orbit',
    accountId: 'a8',
    title: 'Save plan follow-up',
    description: 'Send revised enablement plan after product adoption call.',
    stage: 'Review',
    priority: 'High',
    owner: 'Sasha Delgado',
    due: 'Jun 14',
  },
]

const priorityClass: Record<WorkPriority, string> = {
  High: 'text-neg',
  Medium: 'text-warn',
  Low: 'text-muted',
}

function accountSearch(account: Account, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return accountGlobalFilter(account, needle) || account.segment.toLowerCase().includes(needle)
}

function accountActivity(account: Account, appended: ActivityEvent[]): ActivityEvent[] {
  return [
    ...appended,
    {
      id: `${account.id}-risk`,
      title: account.status === 'Active' ? 'Health check passed' : 'Risk signal opened',
      description: account.status === 'Active'
        ? 'Usage and renewal indicators are inside the expected operating range.'
        : 'Customer success should review adoption, sponsor coverage, and renewal path.',
      actor: account.owner,
      timestamp: '2h ago',
      tone: account.status === 'Active' ? 'positive' : 'warning',
    },
    {
      id: `${account.id}-note`,
      title: 'Account plan updated',
      description: `${account.segment} playbook refreshed with the latest MRR and growth context.`,
      actor: 'Revenue ops',
      timestamp: 'Yesterday',
      tone: 'accent',
    },
  ]
}

interface TemplateProps {
  globalSearch: string
  atRiskOnly: boolean
  timePeriodLabel: string
  assistantDraft?: { id: number }
}

export function CustomerSuccessTemplate({ globalSearch, atRiskOnly, timePeriodLabel, assistantDraft }: TemplateProps) {
  const { accounts } = useAccounts()
  const toast = useToast()
  const [localSearch, setLocalSearch] = useState('')
  const [segment, setSegment] = useState('all')
  const [riskOnly, setRiskOnly] = useState(atRiskOnly)
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [touchpointTitle, setTouchpointTitle] = useState('Executive sponsor follow-up')
  const [touchpointNote, setTouchpointNote] = useState('Confirm next milestone and owner before the weekly review.')
  const [touchpointOutcome, setTouchpointOutcome] = useState('accent')
  const [activityOverrides, setActivityOverrides] = useState<Record<string, ActivityEvent[]>>({})
  const lastAssistantDraftId = useRef<number | null>(null)

  const combinedSearch = [globalSearch, localSearch].filter(Boolean).join(' ')
  const filteredAccounts = useMemo(() => accounts.filter((account) => {
    if (riskOnly && account.status === 'Active') return false
    if (segment !== 'all' && account.segment !== segment) return false
    return accountSearch(account, combinedSearch)
  }), [accounts, combinedSearch, riskOnly, segment])

  const selectedAccount = filteredAccounts.find((account) => account.id === selectedAccountId)
    ?? accounts.find((account) => account.id === selectedAccountId)
    ?? filteredAccounts[0]
    ?? accounts[0]

  const visibleWork = useMemo(() => workItems.filter((item) => {
    const account = accounts.find((entry) => entry.id === item.accountId)
    if (!account) return false
    if (riskOnly && account.status === 'Active') return false
    if (segment !== 'all' && account.segment !== segment) return false
    const haystack = `${item.title} ${item.description} ${item.owner} ${account.name}`.toLowerCase()
    return combinedSearch.trim() ? haystack.includes(combinedSearch.toLowerCase()) : true
  }), [accounts, combinedSearch, riskOnly, segment])

  const gridColumns = useMemo(
    () => accountGridColumns({
      onEdit: (account) => setSelectedAccountId(account.id),
      onDelete: (account) => setSelectedAccountId(account.id),
    }),
    [],
  )

  const selectedActivity = selectedAccount ? accountActivity(selectedAccount, activityOverrides[selectedAccount.id] ?? []) : []
  const openMrr = totalMrr(filteredAccounts)
  const active = activeCount(filteredAccounts)
  const risk = atRiskCount(filteredAccounts)
  const selectedWorkItem = visibleWork.find((item) => item.accountId === selectedAccount?.id) ?? visibleWork[0]

  useEffect(() => {
    if (!assistantDraft || assistantDraft.id === lastAssistantDraftId.current || !selectedAccount) return
    lastAssistantDraftId.current = assistantDraft.id
    setTouchpointTitle(selectedAccount.status === 'Active' ? 'Expansion health check' : 'Renewal risk follow-up')
    setTouchpointOutcome(selectedAccount.status === 'Active' ? 'positive' : 'warning')
    setTouchpointNote(
      `Follow up with ${selectedAccount.owner} on ${selectedAccount.name}. Confirm sponsor coverage, next milestone, and any renewal blockers before the weekly review.`,
    )
    setDrawerOpen(true)
    toast(`Drafted touchpoint note for ${selectedAccount.name}`, 'accent')
  }, [assistantDraft, selectedAccount, toast])

  const saveTouchpoint = () => {
    if (!selectedAccount) return
    const tone = touchpointOutcome as ActivityEvent['tone']
    setActivityOverrides((current) => ({
      ...current,
      [selectedAccount.id]: [
        {
          id: `${selectedAccount.id}-${Date.now()}`,
          title: touchpointTitle,
          description: touchpointNote,
          actor: 'Morgan Operator',
          timestamp: 'Just now',
          tone,
        },
        ...(current[selectedAccount.id] ?? []),
      ],
    }))
    setDrawerOpen(false)
    toast(`Logged touchpoint for ${selectedAccount.name}`, 'pos')
  }

  return (
    <main className="w-full px-6 py-6">
      <PageHeader
        eyebrow="Template / Customer Success"
        title="Customer operations workspace"
        description={`${timePeriodLabel} · A clone-ready app screen for teams that need a queue, account context, activity, and a real data surface.`}
        actions={<Button variant="primary" onClick={() => setDrawerOpen(true)}>Log touchpoint</Button>}
      />

      <KpiSummaryRow>
        <KpiCard label="Managed MRR" value={fmtCurrency(openMrr)} delta={4.6} spark={[22, 24, 27, 29, 31, 33, 34, 36, 35, 38, 41, 44]} />
        <KpiCard label="Active accounts" value={String(active)} delta={2.4} spark={[11, 11, 12, 13, 13, 14, 15, 15, 16, 16, 17, 18]} />
        <KpiCard label="Avg growth" value={fmtPercent(avgGrowth(filteredAccounts))} delta={1.1} spark={[1, 2, 2, 3, 4, 5, 4, 6, 7, 7, 8, 9]} />
        <KpiCard label="Open risks" value={String(risk)} delta={-12.5} spark={[9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3]} negSpark />
      </KpiSummaryRow>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.85fr)]">
        <section className="grid min-w-0 gap-4">
          <Card
            title="Priority work queue"
            description="A practical starting point for approvals, renewals, implementation handoffs, and support escalations."
            actions={<span className="num text-[12px] text-muted">{visibleWork.length} open</span>}
          >
            <div className="grid gap-4">
              <FilterBar actions={<Button size="compact" variant="primary" onClick={() => setDrawerOpen(true)}>Add note</Button>}>
                <Input
                  className="min-w-[220px] flex-1"
                  placeholder="Search queue"
                  aria-label="Search work queue"
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
                />
                <Select className="w-[160px]" aria-label="Segment" value={segment} onChange={(event) => setSegment(event.target.value)}>
                  <option value="all">All segments</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Mid-market">Mid-market</option>
                  <option value="SMB">SMB</option>
                </Select>
                <Switch
                  label={<span className="micro text-muted">Risk only</span>}
                  checked={riskOnly}
                  onChange={(event) => setRiskOnly(event.target.checked)}
                />
              </FilterBar>

              <div className="grid gap-2">
                {visibleWork.map((item) => {
                  const account = accounts.find((entry) => entry.id === item.accountId)
                  const selected = account?.id === selectedAccount?.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => account && setSelectedAccountId(account.id)}
                      className={`grid gap-3 border border-line bg-surface px-3 py-3 text-left hover:bg-surface-2 ${selected ? 'border-accent bg-accent-soft' : ''}`}
                    >
                      <span className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                        <span className="grid min-w-0 gap-1">
                          <span className="text-[14px] font-semibold text-ink">{item.title}</span>
                          <span className="text-[13px] text-muted">{account?.name} · {item.description}</span>
                        </span>
                        <span className="grid justify-items-end gap-1">
                          <span className={`micro ${priorityClass[item.priority]}`}>{item.priority}</span>
                          <span className="num text-[12px] text-faint">{item.due}</span>
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                        <span className="micro rounded-[2px] bg-surface-2 px-1.5 py-0.5 text-muted">{item.stage}</span>
                        <span>{item.owner}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card
            title="Account portfolio"
            description="The same Ledger grid, dropped into a fuller app screen with column filters, selection, and export."
          >
            <DataGrid
              rows={filteredAccounts}
              columns={gridColumns}
              getRowId={(row) => row.id}
              initialState={DEFAULT_STATE}
              globalFilterFn={accountGlobalFilter}
              enableRowSelection
              enableExport
            />
          </Card>
        </section>

        <aside className="grid min-w-0 content-start gap-4">
          {selectedAccount && (
            <Card
              title="Selected account"
              actions={<StatusBadge status={selectedAccount.status} tone={statusTone(selectedAccount.status)} />}
            >
              <div className="grid gap-4">
                <DetailHeader
                  title={selectedAccount.name}
                  subtitle={`${selectedAccount.segment} · ${selectedAccount.owner}`}
                  meta={`${fmtCurrency(selectedAccount.mrr)} MRR · ${fmtPercent(selectedAccount.growth)} growth`}
                  actions={<Button size="compact" onClick={() => setDrawerOpen(true)}>Log note</Button>}
                  className="border border-line"
                />
                <DescriptionList
                  columns={2}
                  items={[
                    { label: 'Owner', value: selectedAccount.owner },
                    { label: 'Status', value: selectedAccount.status },
                    { label: 'ARR', value: fmtCurrency(selectedAccount.arr) },
                    { label: 'Since', value: selectedAccount.since },
                  ]}
                />
                <Stepper
                  currentStepId={selectedWorkItem?.stage === 'Approval' ? 'approve' : selectedWorkItem?.stage === 'Customer reply' ? 'reply' : 'review'}
                  steps={[
                    { id: 'review', label: 'Review', description: 'Validate signal' },
                    { id: 'reply', label: 'Customer reply', description: 'Confirm next step' },
                    { id: 'approve', label: 'Approval', description: 'Route decision' },
                  ]}
                />
                <ActivityFeed title="Account activity" items={selectedActivity} />
              </div>
            </Card>
          )}

          <SettingsPanel title="Template controls" description="Copy this pattern when a screen needs persistent local context next to a table.">
            <div className="grid gap-3">
              <Field label="Workspace">
                <Select defaultValue="cs">
                  <option value="cs">Customer success</option>
                  <option value="ops">Operations</option>
                  <option value="support">Support desk</option>
                </Select>
              </Field>
              <MetadataPanel
                title="Template inventory"
                items={[
                  { label: 'Shell', value: 'Sidebar, top nav, global controls' },
                  { label: 'Workflow', value: 'Queue, detail, drawer form' },
                  { label: 'Data', value: 'KPIs, grid, activity feed' },
                ]}
              />
            </div>
          </SettingsPanel>
        </aside>
      </div>

      {drawerOpen && selectedAccount && (
        <Drawer
          title="Log touchpoint"
          onClose={() => setDrawerOpen(false)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveTouchpoint}>Save note</Button>
            </>
          )}
        >
          <div className="grid gap-4">
            <Toolbar leading={<span className="micro">Account</span>} trailing={<StatusBadge status={selectedAccount.status} tone={statusTone(selectedAccount.status)} />}>
              <span className="text-[13px] text-ink">{selectedAccount.name}</span>
            </Toolbar>
            <Field label="Title" required>
              <Input value={touchpointTitle} onChange={(event) => setTouchpointTitle(event.target.value)} />
            </Field>
            <Field label="Outcome">
              <Select value={touchpointOutcome} onChange={(event) => setTouchpointOutcome(event.target.value)}>
                <option value="accent">Follow-up</option>
                <option value="positive">Healthy</option>
                <option value="warning">Needs review</option>
                <option value="negative">Blocked</option>
              </Select>
            </Field>
            <Field label="Notes">
              <Textarea value={touchpointNote} onChange={(event) => setTouchpointNote(event.target.value)} />
            </Field>
          </div>
        </Drawer>
      )}
    </main>
  )
}
