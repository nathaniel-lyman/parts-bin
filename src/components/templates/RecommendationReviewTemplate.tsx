import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityFeed,
  Button,
  Card,
  Drawer,
  Field,
  InlineAlert,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  Textarea,
  Toolbar,
  useToast,
  type ActivityEvent,
  type EventTone,
} from '../ui'
import { FilterBar } from '../shell'
import { fmtCurrency } from '../../lib/format'

type RecommendationStatus = 'New' | 'Reviewed' | 'Accepted' | 'Rejected' | 'Scheduled'
export type FeedbackAction = 'accept' | 'modify' | 'reject' | 'flag'
type SortMode = 'impact' | 'confidence'

export interface RecommendationAssistantFeedback {
  id: number
  action: FeedbackAction
}

interface Recommendation {
  id: string
  itemId: string
  title: string
  code: string
  category: string
  division: string
  scope: number
  eligible: number
  projectedLow: number
  projectedHigh: number
  confidence: number
  status: RecommendationStatus
  rationale: string
  readiness: 'Ready' | 'Partial' | 'Constrained'
  drivers: Array<{ label: string; score: number }>
  regions: Array<{ name: string; stores: number; coverage: number }>
}

const recommendations: Recommendation[] = [
  {
    id: 'rec-milk',
    itemId: '#005728193',
    title: 'Hearthwell Organic Whole Milk, 64 oz',
    code: 'GRO',
    category: 'Grocery',
    division: 'Food',
    scope: 1420,
    eligible: 3900,
    projectedLow: 1080000,
    projectedHigh: 1620000,
    confidence: 92,
    status: 'New',
    rationale: 'High repeat demand in eligible stores with strong basket attachment and stable supply coverage.',
    readiness: 'Ready',
    drivers: [
      { label: 'Local demand', score: 88 },
      { label: 'Margin headroom', score: 81 },
      { label: 'Supply coverage', score: 72 },
      { label: 'Seasonality', score: 66 },
    ],
    regions: [
      { name: 'Midwest', stores: 360, coverage: 44 },
      { name: 'West', stores: 310, coverage: 39 },
      { name: 'Southeast', stores: 284, coverage: 36 },
      { name: 'Northeast', stores: 241, coverage: 31 },
    ],
  },
  {
    id: 'rec-detergent',
    itemId: '#002748319',
    title: 'Brightleaf Liquid Laundry Detergent, 150 oz',
    code: 'HOU',
    category: 'Household',
    division: 'Consumables',
    scope: 1560,
    eligible: 4100,
    projectedLow: 998000,
    projectedHigh: 1420000,
    confidence: 90,
    status: 'New',
    rationale: 'Consumables velocity is above peer stores and the item fills a price-tier gap in suburban formats.',
    readiness: 'Ready',
    drivers: [
      { label: 'Price gap', score: 84 },
      { label: 'Household demand', score: 79 },
      { label: 'Inventory position', score: 70 },
      { label: 'Planogram fit', score: 62 },
    ],
    regions: [
      { name: 'South Central', stores: 335, coverage: 42 },
      { name: 'Midwest', stores: 296, coverage: 38 },
      { name: 'West', stores: 270, coverage: 34 },
      { name: 'Southeast', stores: 246, coverage: 32 },
    ],
  },
  {
    id: 'rec-coffee',
    itemId: '#008261540',
    title: 'Lumen Home 12-Cup Programmable Coffee Maker',
    code: 'KIT',
    category: 'Kitchen',
    division: 'Home',
    scope: 640,
    eligible: 2400,
    projectedLow: 928000,
    projectedHigh: 1310000,
    confidence: 79,
    status: 'New',
    rationale: 'Opening-price-point gap in eligible stores. High ring and strong margin contribution.',
    readiness: 'Partial',
    drivers: [
      { label: 'Margin headroom', score: 81 },
      { label: 'Local demand', score: 66 },
      { label: 'Inventory position', score: 55 },
      { label: 'Seasonality', score: 44 },
    ],
    regions: [
      { name: 'Midwest', stores: 160, coverage: 36 },
      { name: 'West', stores: 128, coverage: 39 },
      { name: 'Northeast', stores: 104, coverage: 24 },
      { name: 'Southeast', stores: 91, coverage: 27 },
      { name: 'South Central', stores: 86, coverage: 20 },
    ],
  },
  {
    id: 'rec-cold-brew',
    itemId: '#003914627',
    title: 'Northvale Cold Brew Concentrate, 32 oz',
    code: 'BEV',
    category: 'Beverages',
    division: 'Food',
    scope: 980,
    eligible: 3160,
    projectedLow: 872000,
    projectedHigh: 1250000,
    confidence: 88,
    status: 'New',
    rationale: 'Beverage trial is increasing in urban stores and refrigerated set capacity is underused.',
    readiness: 'Ready',
    drivers: [
      { label: 'Trial velocity', score: 86 },
      { label: 'Set capacity', score: 75 },
      { label: 'Margin headroom', score: 69 },
      { label: 'Promo overlap', score: 52 },
    ],
    regions: [
      { name: 'West', stores: 238, coverage: 41 },
      { name: 'Northeast', stores: 210, coverage: 38 },
      { name: 'Mid-Atlantic', stores: 175, coverage: 33 },
      { name: 'Southeast', stores: 142, coverage: 27 },
    ],
  },
  {
    id: 'rec-water',
    itemId: '#007830194',
    title: 'Pacifica Basin Sparkling Water Variety, 24 pk',
    code: 'BEV',
    category: 'Beverages',
    division: 'Food',
    scope: 1340,
    eligible: 3720,
    projectedLow: 817000,
    projectedHigh: 1180000,
    confidence: 86,
    status: 'New',
    rationale: 'Multi-pack water demand is broadening beyond club formats and has low fixture complexity.',
    readiness: 'Ready',
    drivers: [
      { label: 'Basket attach', score: 78 },
      { label: 'Fixture ease', score: 76 },
      { label: 'Demand spread', score: 71 },
      { label: 'Vendor readiness', score: 68 },
    ],
    regions: [
      { name: 'Midwest', stores: 301, coverage: 40 },
      { name: 'Southeast', stores: 268, coverage: 34 },
      { name: 'West', stores: 233, coverage: 31 },
      { name: 'South Central', stores: 201, coverage: 28 },
    ],
  },
  {
    id: 'rec-wipes',
    itemId: '#003508927',
    title: 'Brightleaf Disinfecting Wipes, 75 ct',
    code: 'HOU',
    category: 'Household',
    division: 'Consumables',
    scope: 1610,
    eligible: 4300,
    projectedLow: 757000,
    projectedHigh: 1130000,
    confidence: 89,
    status: 'Scheduled',
    rationale: 'Scheduled reset already covers most high-yield stores; remaining scope should follow supply confirmation.',
    readiness: 'Partial',
    drivers: [
      { label: 'Need-state demand', score: 82 },
      { label: 'Reset timing', score: 77 },
      { label: 'Supply coverage', score: 58 },
      { label: 'Store labor', score: 51 },
    ],
    regions: [
      { name: 'Southeast', stores: 344, coverage: 43 },
      { name: 'Midwest', stores: 312, coverage: 37 },
      { name: 'West', stores: 278, coverage: 33 },
      { name: 'Northeast', stores: 222, coverage: 29 },
    ],
  },
  {
    id: 'rec-tree',
    itemId: '#007451093',
    title: 'Frostline Pre-Lit 7 ft Artificial Tree',
    code: 'SEA',
    category: 'Seasonal',
    division: 'Home',
    scope: 410,
    eligible: 1580,
    projectedLow: 689000,
    projectedHigh: 992000,
    confidence: 75,
    status: 'Reviewed',
    rationale: 'High upside but timing and backroom readiness need merchant review before store commitment.',
    readiness: 'Constrained',
    drivers: [
      { label: 'Seasonality', score: 91 },
      { label: 'Margin headroom', score: 68 },
      { label: 'Inventory position', score: 42 },
      { label: 'Labor intensity', score: 39 },
    ],
    regions: [
      { name: 'Midwest', stores: 112, coverage: 30 },
      { name: 'Northeast', stores: 88, coverage: 24 },
      { name: 'West', stores: 71, coverage: 21 },
      { name: 'Southeast', stores: 64, coverage: 17 },
    ],
  },
  {
    id: 'rec-tumbler',
    itemId: '#006135872',
    title: 'Trailridge Insulated 40 oz Tumbler',
    code: 'SPO',
    category: 'Sporting Goods',
    division: 'General Merchandise',
    scope: 1180,
    eligible: 3600,
    projectedLow: 661000,
    projectedHigh: 991000,
    confidence: 84,
    status: 'Reviewed',
    rationale: 'Social-led demand is durable enough for a broader run, but endcap conflicts remain unresolved.',
    readiness: 'Partial',
    drivers: [
      { label: 'Local demand', score: 83 },
      { label: 'Trend durability', score: 74 },
      { label: 'Fixture conflict', score: 49 },
      { label: 'Vendor fill', score: 47 },
    ],
    regions: [
      { name: 'West', stores: 276, coverage: 40 },
      { name: 'Southeast', stores: 232, coverage: 34 },
      { name: 'Midwest', stores: 198, coverage: 28 },
      { name: 'Northeast', stores: 150, coverage: 22 },
    ],
  },
  {
    id: 'rec-dog-food',
    itemId: '#009317648',
    title: 'Pawhaven Grain-Free Dog Food, 24 lb',
    code: 'PET',
    category: 'Pet',
    division: 'Consumables',
    scope: 760,
    eligible: 2700,
    projectedLow: 616000,
    projectedHigh: 897000,
    confidence: 80,
    status: 'Rejected',
    rationale: 'Projected lift is real, but eligible stores overlap too heavily with constrained pet aisle resets.',
    readiness: 'Constrained',
    drivers: [
      { label: 'Pet demand', score: 79 },
      { label: 'Reset conflict', score: 35 },
      { label: 'Vendor fill', score: 58 },
      { label: 'Margin headroom', score: 61 },
    ],
    regions: [
      { name: 'South Central', stores: 190, coverage: 31 },
      { name: 'Southeast', stores: 166, coverage: 29 },
      { name: 'Midwest', stores: 118, coverage: 20 },
      { name: 'West', stores: 94, coverage: 18 },
    ],
  },
  {
    id: 'rec-sausage',
    itemId: '#001629583',
    title: 'Mapleline Maple Breakfast Sausage, 16 oz',
    code: 'GRO',
    category: 'Grocery',
    division: 'Food',
    scope: 1090,
    eligible: 3400,
    projectedLow: 589000,
    projectedHigh: 861000,
    confidence: 81,
    status: 'Accepted',
    rationale: 'Accepted for the next reset after strong breakfast attach and simple cold-case placement.',
    readiness: 'Ready',
    drivers: [
      { label: 'Basket attach', score: 80 },
      { label: 'Fixture ease', score: 77 },
      { label: 'Inventory position', score: 70 },
      { label: 'Promo lift', score: 53 },
    ],
    regions: [
      { name: 'Midwest', stores: 264, coverage: 37 },
      { name: 'South Central', stores: 214, coverage: 31 },
      { name: 'Southeast', stores: 188, coverage: 27 },
      { name: 'West', stores: 142, coverage: 23 },
    ],
  },
]

const statusOrder: Array<RecommendationStatus | 'All'> = ['All', 'New', 'Reviewed', 'Accepted', 'Rejected', 'Scheduled']
const actionLabels: Record<FeedbackAction, string> = {
  accept: 'Accept',
  modify: 'Modify',
  reject: 'Reject',
  flag: 'Flag issue',
}
const actionStatus: Partial<Record<FeedbackAction, RecommendationStatus>> = {
  accept: 'Accepted',
  modify: 'Reviewed',
  reject: 'Rejected',
}
const actionTone: Record<FeedbackAction, EventTone> = {
  accept: 'positive',
  modify: 'warning',
  reject: 'negative',
  flag: 'accent',
}
const reasonOptions: Record<FeedbackAction, string[]> = {
  accept: ['Matches operating plan', 'High-confidence lift', 'Store scope is ready'],
  modify: ['Reduce store scope', 'Change timing', 'Needs merchant adjustment'],
  reject: ['Scope not ready', 'Economics too weak', 'Conflicts with reset plan'],
  flag: ['Data quality issue', 'Supply risk', 'Store feedback needed'],
}
const statusClasses: Record<RecommendationStatus, string> = {
  New: 'bg-accent-soft text-accent',
  Reviewed: 'bg-warn-soft text-warn',
  Accepted: 'bg-pos-soft text-pos',
  Rejected: 'bg-neg-soft text-neg',
  Scheduled: 'bg-intel-soft text-intel',
}
const codeClasses: Record<string, string> = {
  GRO: 'bg-pos-soft text-pos',
  HOU: 'bg-accent-soft text-accent',
  KIT: 'bg-warn-soft text-warn',
  BEV: 'bg-accent-soft text-accent',
  SEA: 'bg-neg-soft text-neg',
  SPO: 'bg-pos-soft text-pos',
  PET: 'bg-warn-soft text-warn',
}
const readinessTone: Record<Recommendation['readiness'], 'pos' | 'warn' | 'neg'> = {
  Ready: 'pos',
  Partial: 'warn',
  Constrained: 'neg',
}

function formatImpact(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(value >= 10000000 ? 0 : 2)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return fmtCurrency(value).replace('.0', '')
}

function formatPercent(value: number, total: number) {
  return `${Math.round((value / total) * 100)}%`
}

function StatusPill({ status }: { status: RecommendationStatus }) {
  return (
    <span className={`micro inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 ${statusClasses[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const tone = value >= 85 ? 'bg-pos' : value >= 76 ? 'bg-warn' : 'bg-neg'
  return (
    <span className="flex min-w-[128px] items-center gap-2">
      <span className="num w-7 text-right text-[13px] font-semibold text-ink">{value}</span>
      <span className="h-1.5 flex-1 rounded-[2px] bg-surface-2">
        <span className={`block h-full rounded-[2px] ${tone}`} style={{ width: `${value}%` }} />
      </span>
    </span>
  )
}

function MiniBar({ value, tone = 'bg-accent' }: { value: number; tone?: string }) {
  return (
    <span className="block h-2 rounded-[2px] bg-surface-2">
      <span className={`block h-full rounded-[2px] ${tone}`} style={{ width: `${value}%` }} />
    </span>
  )
}

function RecommendationCode({ code }: { code: string }) {
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[4px] border border-line text-[11px] font-semibold ${codeClasses[code] ?? 'bg-surface-2 text-muted'}`}>
      {code}
    </span>
  )
}

interface RecommendationReviewTemplateProps {
  globalSearch: string
  timePeriodLabel: string
  assistantFeedback?: RecommendationAssistantFeedback
}

export function RecommendationReviewTemplate({ globalSearch, timePeriodLabel, assistantFeedback }: RecommendationReviewTemplateProps) {
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState<(typeof statusOrder)[number]>('All')
  const [category, setCategory] = useState('all')
  const [division, setDivision] = useState('all')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('impact')
  const [selectedId, setSelectedId] = useState(recommendations[2]?.id ?? recommendations[0].id)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RecommendationStatus>>({})
  const [activity, setActivity] = useState<Record<string, ActivityEvent[]>>({})
  const [feedbackAction, setFeedbackAction] = useState<FeedbackAction | null>(null)
  const [feedbackReason, setFeedbackReason] = useState(reasonOptions.accept[0])
  const [feedbackNote, setFeedbackNote] = useState('Reviewed against scope, readiness, and projected lift.')
  const lastAssistantFeedbackId = useRef<number | null>(null)

  const enriched = useMemo(
    () => recommendations.map((recommendation) => ({
      ...recommendation,
      status: statusOverrides[recommendation.id] ?? recommendation.status,
    })),
    [statusOverrides],
  )
  const categories = useMemo(() => Array.from(new Set(recommendations.map((item) => item.category))).sort(), [])
  const divisions = useMemo(() => Array.from(new Set(recommendations.map((item) => item.division))).sort(), [])
  const counts = useMemo(() => {
    const next = new Map<(typeof statusOrder)[number], number>([['All', enriched.length]])
    for (const status of statusOrder) if (status !== 'All') next.set(status, enriched.filter((item) => item.status === status).length)
    return next
  }, [enriched])
  const combinedQuery = [globalSearch, query].filter(Boolean).join(' ').trim().toLowerCase()
  const visibleRecommendations = useMemo(() => {
    const filtered = enriched.filter((item) => {
      if (statusFilter !== 'All' && item.status !== statusFilter) return false
      if (category !== 'all' && item.category !== category) return false
      if (division !== 'all' && item.division !== division) return false
      if (!combinedQuery) return true
      const haystack = `${item.title} ${item.itemId} ${item.category} ${item.division} ${item.code}`.toLowerCase()
      return haystack.includes(combinedQuery)
    })
    return filtered.sort((a, b) => sortMode === 'impact' ? b.projectedHigh - a.projectedHigh : b.confidence - a.confidence)
  }, [category, combinedQuery, division, enriched, sortMode, statusFilter])

  const selected = visibleRecommendations.find((item) => item.id === selectedId)
    ?? enriched.find((item) => item.id === selectedId)
    ?? visibleRecommendations[0]
    ?? enriched[0]
  const selectedActivity = [
    ...(activity[selected.id] ?? []),
    {
      id: `${selected.id}-model`,
      title: 'Model recommendation generated',
      description: `${selected.scope.toLocaleString()} stores ranked by expected lift and readiness.`,
      timestamp: '2h ago',
      tone: 'accent' as EventTone,
    },
  ]

  useEffect(() => {
    if (!assistantFeedback || assistantFeedback.id === lastAssistantFeedbackId.current) return
    lastAssistantFeedbackId.current = assistantFeedback.id
    const action = assistantFeedback.action
    setFeedbackAction(action)
    setFeedbackReason(reasonOptions[action][0])
    setFeedbackNote(action === 'modify'
      ? `Assistant draft: adjust scope or launch timing for ${selected.title}; confirm readiness gaps before routing.`
      : `Assistant draft: ${actionLabels[action].toLowerCase()} this recommendation based on scope, readiness, and projected lift.`)
    toast(`Prepared ${actionLabels[action].toLowerCase()} feedback for ${selected.title}`, 'accent')
  }, [assistantFeedback, selected.title, toast])

  const openFeedback = (action: FeedbackAction) => {
    setFeedbackAction(action)
    setFeedbackReason(reasonOptions[action][0])
    setFeedbackNote(action === 'modify'
      ? 'Adjust scope or timing before routing this recommendation.'
      : 'Reviewed against scope, readiness, and projected lift.')
  }

  const submitFeedback = () => {
    if (!feedbackAction) return
    const nextStatus = actionStatus[feedbackAction]
    if (nextStatus) setStatusOverrides((current) => ({ ...current, [selected.id]: nextStatus }))
    const event: ActivityEvent = {
      id: `${selected.id}-${feedbackAction}-${Date.now()}`,
      title: `${actionLabels[feedbackAction]} submitted`,
      description: `${feedbackReason}. ${feedbackNote}`,
      actor: 'Morgan Operator',
      timestamp: 'Just now',
      tone: actionTone[feedbackAction],
    }
    setActivity((current) => ({ ...current, [selected.id]: [event, ...(current[selected.id] ?? [])] }))
    toast(`${actionLabels[feedbackAction]} feedback saved for ${selected.title}`, feedbackAction === 'reject' ? 'neg' : feedbackAction === 'accept' ? 'pos' : 'accent')
    setFeedbackAction(null)
  }

  return (
    <main className="w-full px-6 py-6">
      <PageHeader
        eyebrow="Template / Recommendation Review"
        title="Recommendation review console"
        description={`${timePeriodLabel} - Queue-only recipe for ranking model options, inspecting detail, and capturing operator feedback.`}
        actions={<span className="num text-[13px] text-muted"><span className="text-pos">●</span> Model v4.2 - refreshed 2h ago</span>}
      />

      <div className="mb-4 grid gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 border border-line bg-surface px-3 py-2">
          <div className="min-w-0 max-w-full overflow-x-auto">
            <SegmentedControl
              label="Recommendation status"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as (typeof statusOrder)[number])}
              options={statusOrder.map((status) => ({
                value: status,
                label: <span>{status} <span className="num text-muted">{counts.get(status) ?? 0}</span></span>,
              }))}
            />
          </div>
          <span className="num ml-auto text-[12px] text-muted">{visibleRecommendations.length} visible</span>
        </div>
        <FilterBar actions={(
          <SegmentedControl
            label="Sort recommendations"
            size="compact"
            value={sortMode}
            onValueChange={(value) => setSortMode(value as SortMode)}
            options={[
              { value: 'impact', label: 'Impact' },
              { value: 'confidence', label: 'Confidence' },
            ]}
          />
        )}
        >
          <Select className="w-[190px]" aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
          <Select className="w-[190px]" aria-label="Division" value={division} onChange={(event) => setDivision(event.target.value)}>
            <option value="all">All divisions</option>
            {divisions.map((name) => <option key={name} value={name}>{name}</option>)}
          </Select>
          <Input
            className="min-w-[240px] flex-1"
            aria-label="Search recommendations"
            placeholder="Item # or keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </FilterBar>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card
          title={`${visibleRecommendations.length} recommendations`}
          description="Ranked model options with custom row content for operator triage."
          actions={<span className="micro text-accent">{sortMode === 'impact' ? 'Impact sorted' : 'Confidence sorted'}</span>}
        >
          <div className="max-h-[720px] overflow-auto border border-line">
            {visibleRecommendations.map((item, index) => {
              const selectedRow = item.id === selected.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selectedRow}
                  onClick={() => setSelectedId(item.id)}
                  className={`grid w-full grid-cols-[2.25rem_3.5rem_minmax(0,1fr)] items-center gap-3 border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-surface-2 lg:grid-cols-[2.25rem_3.5rem_minmax(220px,1fr)_minmax(150px,0.45fr)_minmax(150px,0.5fr)_minmax(128px,0.4fr)_auto] ${selectedRow ? 'bg-accent-soft shadow-[inset_3px_0_0_var(--accent)]' : 'bg-surface'}`}
                >
                  <span className="num text-center text-[13px] text-muted">{index + 1}</span>
                  <RecommendationCode code={item.code} />
                  <span className="grid min-w-0 gap-1">
                    <span className="truncate text-[14px] font-semibold text-ink">{item.title}</span>
                    <span className="truncate text-[12px] text-muted">{item.itemId} - {item.category} - {item.division}</span>
                    <span className="flex flex-wrap items-center gap-2 lg:hidden">
                      <span className="num text-[12px] font-semibold text-ink">{formatImpact(item.projectedLow)}-{formatImpact(item.projectedHigh)}</span>
                      <StatusPill status={item.status} />
                    </span>
                  </span>
                  <span className="hidden gap-1 lg:grid">
                    <span className="num text-[14px] font-semibold text-ink">{item.scope.toLocaleString()} <span className="font-normal text-muted">stores</span></span>
                    <MiniBar value={Math.round((item.scope / item.eligible) * 100)} tone="bg-muted" />
                    <span className="text-[12px] text-muted">{formatPercent(item.scope, item.eligible)} fleet</span>
                  </span>
                  <span className="hidden justify-items-end gap-1 lg:grid">
                    <span className="num text-[14px] font-semibold text-ink">{formatImpact(item.projectedLow)}-{formatImpact(item.projectedHigh)}</span>
                    <span className="text-[12px] text-muted">proj. incr. / yr</span>
                  </span>
                  <span className="hidden lg:block"><ConfidenceBar value={item.confidence} /></span>
                  <span className="hidden lg:inline-flex"><StatusPill status={item.status} /></span>
                </button>
              )
            })}
          </div>
        </Card>

        <aside className="grid min-w-0 content-start gap-4">
          <Card title="Recommendation detail" actions={<StatusPill status={selected.status} />}>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <RecommendationCode code={selected.code} />
                <div className="grid min-w-0 gap-1">
                  <h2 className="m-0 text-[18px] font-semibold text-ink">{selected.title}</h2>
                  <p className="m-0 text-[13px] text-muted">{selected.itemId} - {selected.category} - {selected.division}</p>
                </div>
              </div>

              <div data-testid="recommendation-detail-metrics" className="grid grid-cols-2 border border-line bg-surface-2">
                <div className="col-span-2 border-b border-line p-3">
                  <div className="micro">Proj. incr. / yr</div>
                  <div className="num mt-2 text-[20px] font-semibold text-ink">{formatImpact(selected.projectedLow)}-{formatImpact(selected.projectedHigh)}</div>
                </div>
                <div className="border-r border-line p-3">
                  <div className="micro">Store scope</div>
                  <div className="num mt-2 text-[20px] font-semibold text-ink">{selected.scope.toLocaleString()}</div>
                  <div className="text-[12px] text-muted">{formatPercent(selected.scope, selected.eligible)} of {selected.eligible.toLocaleString()}</div>
                </div>
                <div className="p-3">
                  <div className="micro">Confidence</div>
                  <div className="num mt-2 text-[20px] font-semibold text-ink">{selected.confidence}</div>
                  <div className="text-[12px] text-muted">{selected.confidence >= 85 ? 'High' : selected.confidence >= 76 ? 'Medium' : 'Review'}</div>
                </div>
              </div>

              <p className="m-0 text-[13px] text-muted">{selected.rationale}</p>

              <section className="grid gap-3">
                <div className="micro">Top drivers</div>
                {selected.drivers.map((driver) => (
                  <div key={driver.label} className="grid grid-cols-[130px_1fr_2rem] items-center gap-2 text-[13px]">
                    <span className="text-muted">{driver.label}</span>
                    <MiniBar value={driver.score} />
                    <span className="num text-right text-muted">{driver.score}</span>
                  </div>
                ))}
              </section>

              <section className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="micro">Store scope by region</div>
                  <span className="num text-[12px] text-muted">{selected.scope.toLocaleString()} stores</span>
                </div>
                {selected.regions.map((region) => (
                  <div key={region.name} className="grid grid-cols-[92px_1fr_4.5rem] items-center gap-2 text-[13px]">
                    <span className="text-muted">{region.name}</span>
                    <MiniBar value={region.coverage * 2} />
                    <span className="num text-right text-muted">{region.stores} - {region.coverage}%</span>
                  </div>
                ))}
              </section>

              <InlineAlert tone={readinessTone[selected.readiness]} title={`${selected.readiness} readiness`}>
                {selected.readiness === 'Ready'
                  ? 'Store scope and inventory signals are ready for decision.'
                  : selected.readiness === 'Partial'
                    ? 'Some stores need allocation or fixture confirmation before rollout.'
                    : 'Recommendation should be reviewed before a decision is routed.'}
              </InlineAlert>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button variant="primary" onClick={() => openFeedback('accept')}>Accept</Button>
                <Button onClick={() => openFeedback('modify')}>Modify</Button>
                <Button variant="destructive" onClick={() => openFeedback('reject')}>Reject</Button>
                <Button variant="ghost" onClick={() => openFeedback('flag')}>Flag</Button>
              </div>

              <ActivityFeed title="Feedback history" items={selectedActivity} />
            </div>
          </Card>
        </aside>
      </div>

      {feedbackAction && (
        <Drawer
          title={`${actionLabels[feedbackAction]} recommendation`}
          onClose={() => setFeedbackAction(null)}
          footer={(
            <>
              <Button variant="secondary" onClick={() => setFeedbackAction(null)}>Cancel</Button>
              <Button variant={feedbackAction === 'reject' ? 'destructive' : 'primary'} onClick={submitFeedback}>Submit feedback</Button>
            </>
          )}
        >
          <div className="grid gap-4">
            <Toolbar leading={<span className="micro">Selected item</span>}>
              <span className="text-[13px] font-medium text-ink">{selected.title}</span>
            </Toolbar>
            <Field label="Reason">
              <Select value={feedbackReason} onChange={(event) => setFeedbackReason(event.target.value)}>
                {reasonOptions[feedbackAction].map((reason) => <option key={reason} value={reason}>{reason}</option>)}
              </Select>
            </Field>
            <Field label="Feedback note">
              <Textarea value={feedbackNote} rows={5} onChange={(event) => setFeedbackNote(event.target.value)} />
            </Field>
          </div>
        </Drawer>
      )}
    </main>
  )
}
