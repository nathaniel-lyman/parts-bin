import type { Account } from '../../data/types'
import { atRiskCount, avgGrowth, segmentShares, totalMrr } from '../../selectors/metrics'
import { fmtCurrency, fmtPercent, formatCurrencyK } from '../../lib/format'
import type { AssistantDashboardEvidence, RevenueMovementEvidence, RevenueMovementEvidencePoint } from './dashboardEvidence'
import type { ChatAdapter } from './types'

/** One prompt per demo route; the panel renders these as suggestion chips. */
export const DEMO_SUGGESTIONS = [
  'Summarize sample value',
  'Which rows need review?',
  'What is our average change?',
  'How do I integrate a real model?',
]

export type AssistantRouteKind =
  | 'accounts'
  | 'components'
  | 'settings'
  | 'unknown'

export interface AssistantSavedViewRef {
  id: string
  name: string
}

export interface AssistantGridFilterRef {
  id: string
  value: string
}

export interface AssistantGridSortRef {
  id: string
  desc: boolean
}

export interface AssistantGridContext {
  visibleAccounts: Account[]
  selectedAccounts: Account[]
  totalRowCount: number
  visibleRowCount: number
  selectedRowCount: number
  globalSearch: string
  quickFilter: string
  atRiskOnly: boolean
  timePeriodLabel: string
  columnFilters: AssistantGridFilterRef[]
  sorting: AssistantGridSortRef[]
  savedViews: AssistantSavedViewRef[]
  currentSavedViewName?: string
}

export interface AssistantScreenContext {
  route: string
  routeLabel: string
  routeKind: AssistantRouteKind
  activeTemplate?: string
  globalSearch?: string
  atRiskOnly?: boolean
  timePeriodLabel?: string
  grid?: AssistantGridContext
  dashboardEvidence?: AssistantDashboardEvidence
}

export interface AssistantActionResult {
  title: string
  body: string
}

export interface AssistantActions {
  createSavedView?: (name: string) => AssistantActionResult
}

export interface DemoAdapterOptions {
  delayMs?: number
  getContext?: () => AssistantScreenContext | undefined
  actions?: AssistantActions
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// fmtPercent takes Math.abs, so restore the sign explicitly.
const signedPercent = (n: number) => `${n < 0 ? '-' : ''}${fmtPercent(n)}`

function scopedAccounts(accounts: Account[], context: AssistantScreenContext | undefined): Account[] {
  return context?.grid?.visibleAccounts ?? accounts
}

function filterEvidence(context: AssistantScreenContext | undefined): string {
  const grid = context?.grid
  const filters: string[] = []
  const globalSearch = context?.globalSearch?.trim() || grid?.globalSearch.trim() || ''
  if (globalSearch) filters.push(`global search "${globalSearch}"`)
  if (grid?.quickFilter.trim()) filters.push(`quick filter "${grid.quickFilter.trim()}"`)
  if (grid?.atRiskOnly || context?.atRiskOnly) filters.push('review focus')
  if (grid?.columnFilters.length) {
    filters.push(`column filters ${grid.columnFilters.map((filter) => `${filter.id}=${filter.value}`).join(', ')}`)
  }
  return filters.length ? `Filters: ${filters.join('; ')}.` : 'Filters: none.'
}

function gridEvidenceLine(context: AssistantScreenContext | undefined, accounts: Account[]): string {
  const grid = context?.grid
  if (!grid) return `Grid scope: full sample dataset (${accounts.length} rows) because no screen context is available.`
  const selected = grid.selectedRowCount === 1 ? '1 row selected' : `${grid.selectedRowCount} rows selected`
  return `Grid scope: ${grid.visibleRowCount} of ${grid.totalRowCount} rows visible, ${selected}. ${filterEvidence(context)}`
}

function evidenceSection(lines: string[]): string[] {
  return [
    '**Evidence used**',
    ...lines.map((line) => `- ${line}`),
  ]
}

function mrrAnswer(accounts: Account[], context: AssistantScreenContext | undefined): string {
  const scoped = scopedAccounts(accounts, context)
  const shares = segmentShares(scoped)
  const total = shares.reduce((sum, s) => sum + s.value, 0)
  const rows = shares.map(
    (s) => `| ${s.segment} | ${fmtCurrency(s.value)} | ${total ? ((s.value / total) * 100).toFixed(1) : '0.0'}% |`,
  )
  return [
    `Total active sample value is **${fmtCurrency(totalMrr(scoped))}** for the current row scope.`,
    '',
    '| Segment | Value | Share |',
    '| --- | --- | --- |',
    ...rows,
    '',
    ...evidenceSection([
      gridEvidenceLine(context, accounts),
      'Metric rule: active sample value excludes archived rows, matching the component assembly KPIs.',
    ]),
  ].join('\n')
}

function riskAnswer(accounts: Account[], context: AssistantScreenContext | undefined): string {
  const scoped = scopedAccounts(accounts, context)
  const atRisk = scoped.filter((a) => a.status !== 'Active')
  if (!atRisk.length) {
    return [
      'No rows currently need review — every row in scope is **Active**.',
      '',
      ...evidenceSection([
        gridEvidenceLine(context, accounts),
        'Review rule: At risk and Churned demo statuses count as needing attention.',
      ]),
    ].join('\n')
  }
  return [
    `**${atRiskCount(scoped)}** of ${scoped.length} rows in scope need attention:`,
    '',
    ...atRisk.map((a) => `- **${a.name}** — ${a.status}, ${fmtCurrency(a.mrr)} sample value`),
    '',
    ...evidenceSection([
      gridEvidenceLine(context, accounts),
      'Review rule: At risk and Churned demo statuses count as needing attention.',
    ]),
  ].join('\n')
}

function growthAnswer(accounts: Account[], context: AssistantScreenContext | undefined): string {
  const scoped = scopedAccounts(accounts, context)
  const top = [...scoped].sort((a, b) => b.growth - a.growth).slice(0, 3)
  return [
    `Average change across the current row scope is **${signedPercent(avgGrowth(scoped))}**.`,
    '',
    'Largest positive changes:',
    ...top.map((a) => `- **${a.name}** — ${signedPercent(a.growth)}`),
    '',
    ...evidenceSection([
      gridEvidenceLine(context, accounts),
      'Change rule: average change includes all scoped rows, including archived rows.',
    ]),
  ].join('\n')
}

function actionAnswer(result: AssistantActionResult): string {
  return [`**${result.title}**`, '', result.body].join('\n')
}

function compactAccountList(accounts: Account[]): string[] {
  return accounts.map((account) => (
    `- **${account.name}** - ${account.status}, ${fmtCurrency(account.mrr)} value, ${signedPercent(account.growth)} change, owner ${account.owner}`
  ))
}

function screenAnswer(context: AssistantScreenContext | undefined): string {
  if (!context) {
    return [
      'I do not have screen context yet. Open the assistant from inside the parts-bin app shell so I can read the active route and grid state.',
      '',
      ...evidenceSection(['No route, chart, or grid evidence is available in this adapter context yet.']),
    ].join('\n')
  }
  const lines = [
    `You are on **${context.routeLabel}** (${context.route}).`,
  ]
  if (context.activeTemplate) lines.push(`Active template: **${context.activeTemplate}**.`)
  if (context.timePeriodLabel) lines.push(`Time period: **${context.timePeriodLabel}**.`)
  if (context.globalSearch?.trim()) lines.push(`Global search: **${context.globalSearch.trim()}**.`)
  if (context.atRiskOnly) lines.push('Review focus is enabled.')
  if (context.grid) {
    const grid = context.grid
    lines.push(`${grid.visibleRowCount} of ${grid.totalRowCount} grid rows are visible, with ${grid.selectedRowCount} selected.`)
    if (grid.quickFilter.trim()) lines.push(`Grid quick filter: **${grid.quickFilter.trim()}**.`)
    if (grid.columnFilters.length) lines.push(`Column filters: ${grid.columnFilters.map((filter) => `${filter.id}=${filter.value}`).join(', ')}.`)
    if (grid.currentSavedViewName) lines.push(`Current saved view: **${grid.currentSavedViewName}**.`)
    else if (grid.savedViews.length) lines.push(`Saved views available: ${grid.savedViews.map((view) => view.name).join(', ')}.`)
  }
  lines.push('', ...evidenceSection([
    `Route context: ${context.routeKind}.`,
    context.grid ? gridEvidenceLine(context, context.grid.visibleAccounts) : 'Grid scope: no DataGrid context is attached on this route.',
    context.dashboardEvidence?.revenueMovement
      ? `Chart evidence attached: ${context.dashboardEvidence.revenueMovement.sourceTitle}.`
      : 'Chart evidence attached: none.',
  ]))
  return lines.join('\n')
}

function selectedAccountsAnswer(context: AssistantScreenContext | undefined): string {
  const selected = context?.grid?.selectedAccounts ?? []
  if (!context?.grid) {
    return [
      'Open the sample grid first, then select rows and ask me to summarize them.',
      '',
      ...evidenceSection(['No grid selection context is available yet.']),
    ].join('\n')
  }
  if (!selected.length) {
    return [
      'No rows are selected. Select one or more rows in the grid and I will summarize just those rows.',
      '',
      ...evidenceSection([
        gridEvidenceLine(context, context.grid.visibleAccounts),
        'Selection source: DataGrid selected rows.',
      ]),
    ].join('\n')
  }
  const selectedMrr = totalMrr(selected)
  return [
    `You selected **${selected.length}** row${selected.length === 1 ? '' : 's'} totaling **${fmtCurrency(selectedMrr)}** active sample value.`,
    '',
    ...compactAccountList(selected),
    '',
    ...evidenceSection([
      gridEvidenceLine(context, context.grid.visibleAccounts),
      'Selection source: DataGrid selected rows.',
      'Metric rule: selected active sample value excludes archived rows.',
    ]),
  ].join('\n')
}

function movementPointLine(label: string, point: RevenueMovementEvidencePoint | undefined): string | undefined {
  if (!point) return undefined
  return `${label}: ${point.month} at ${formatCurrencyK(point.net)} net (${formatCurrencyK(point.newMrr)} new + ${formatCurrencyK(point.expansion)} expansion - ${formatCurrencyK(point.churnLoss)} decrease).`
}

function revenueMovementEvidenceLines(evidence: RevenueMovementEvidence): string[] {
  const lines = [
    `Chart: ${evidence.sourceTitle}, ${evidence.rowCount} monthly rows, ${evidence.timePeriodLabel}.`,
    `Totals: ${formatCurrencyK(evidence.totalNew)} new + ${formatCurrencyK(evidence.totalExpansion)} expansion - ${formatCurrencyK(evidence.totalChurnLoss)} decrease = ${formatCurrencyK(evidence.totalNet)} net.`,
    `Chart controls: labels ${evidence.labelsVisible ? 'shown' : 'hidden'}, bar width ${evidence.barWidth}px.`,
    movementPointLine('Latest visible month', evidence.latestMonth),
    movementPointLine('Strongest net month', evidence.strongestNetMonth),
    movementPointLine('Weakest net month', evidence.weakestNetMonth),
    evidence.largestChurnLossMonth
      ? `Largest decrease month: ${evidence.largestChurnLossMonth.month} at ${formatCurrencyK(evidence.largestChurnLossMonth.churnLoss)}.`
      : undefined,
  ]
  return lines.filter((line): line is string => Boolean(line))
}

function revenueMovementAnswer(accounts: Account[], context: AssistantScreenContext | undefined): string {
  const scoped = context?.grid?.visibleAccounts ?? accounts
  const sortedByMrr = [...scoped].sort((a, b) => b.mrr - a.mrr)
  const contraction = scoped.filter((account) => account.growth < 0)
  const expansion = scoped.filter((account) => account.growth > 0)
  const evidence = context?.dashboardEvidence?.revenueMovement
  const chartLines = evidence && evidence.rowCount > 0 ? revenueMovementEvidenceLines(evidence) : []
  const movementTone = !evidence || evidence.totalNet === 0
    ? 'flat'
    : evidence.totalNet > 0
      ? 'net positive'
      : 'net negative'

  return [
    evidence && evidence.rowCount > 0
      ? `Signed movement is **${movementTone}** in the visible chart: ${formatCurrencyK(evidence.totalNet)} net over ${evidence.rowCount} monthly rows.`
      : 'I do not have signed movement chart evidence attached yet, so I can only explain the current grid scope.',
    '',
    evidence?.latestMonth
      ? `Latest visible month: **${evidence.latestMonth.month}** ended at **${formatCurrencyK(evidence.latestMonth.net)} net**.`
      : 'Latest visible month: unavailable.',
    '',
    `For the current grid scope, active sample value is **${fmtCurrency(totalMrr(scoped))}** across ${scoped.length} visible rows.`,
    '',
    `Positive signal: **${expansion.length}** rows are increasing; negative signal: **${contraction.length}** rows are decreasing or archived.`,
    '',
    'Largest visible value contributors:',
    ...compactAccountList(sortedByMrr.slice(0, 3)),
    '',
    ...evidenceSection([
      'Separation: chart evidence uses monthly movement rows; grid evidence uses currently visible sample rows.',
      gridEvidenceLine(context, accounts),
      ...chartLines,
    ]),
  ].join('\n')
}

function savedViewName(context: AssistantScreenContext | undefined): string {
  const grid = context?.grid
  if (!grid) return 'Assistant view'
  const bits: string[] = []
  if (grid.atRiskOnly) bits.push('Review focus')
  if (grid.quickFilter.trim()) bits.push(`Quick filter ${grid.quickFilter.trim()}`)
  if (grid.globalSearch.trim()) bits.push(`Search ${grid.globalSearch.trim()}`)
  if (!bits.length) bits.push('Current grid')
  return bits.join(' - ')
}

function extractNamedView(text: string): string | undefined {
  const quoted = text.match(/(?:named|called)\s+["']([^"']+)["']/i)
  if (quoted?.[1]?.trim()) return quoted[1].trim()
  const plain = text.match(/(?:named|called)\s+([a-z0-9][\w -]{1,48})/i)
  return plain?.[1]?.trim()
}

function createSavedViewAnswer(
  text: string,
  context: AssistantScreenContext | undefined,
  actions: AssistantActions | undefined,
): string {
  if (!context?.grid) return 'Open the sample grid first and I can save the current columns, filters, sort, density, and page size as a view.'
  if (!actions?.createSavedView) return 'This assistant can describe the current grid, but no saved-view action is registered on this screen.'
  return actionAnswer(actions.createSavedView(extractNamedView(text) ?? savedViewName(context)))
}

export function contextualAssistantSuggestions(context: AssistantScreenContext | undefined): string[] {
  if (!context) return DEMO_SUGGESTIONS
  if (context.routeKind === 'accounts') {
    const selected = context.grid?.selectedRowCount ?? 0
    return [
      selected ? `Summarize ${selected} selected row${selected === 1 ? '' : 's'}` : 'Summarize selected rows',
      'Create a saved view for this screen',
      'Explain this signed movement',
      'Which rows need review?',
    ]
  }
  return [
    'Summarize the current screen',
    'How do I integrate a real model?',
    'Summarize sample value',
    'Which rows need review?',
  ]
}

const INTEGRATE_ANSWER = [
  'This demo streams scripted answers, but every component renders against the `ChatAdapter` seam — swap the adapter and the whole UI goes live:',
  '',
  '```ts',
  'import type { ChatAdapter } from "./components/chat"',
  '',
  'export const claudeAdapter: ChatAdapter = {',
  '  async *send(messages, { signal }) {',
  '    const stream = client.messages.stream({',
  '      model: "claude-sonnet-4-6",',
  '      max_tokens: 1024,',
  '      messages: messages.map(({ role, content }) => ({ role, content })),',
  '    }, { signal })',
  '    for await (const event of stream) {',
  '      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {',
  '        yield event.delta.text',
  '      }',
  '    }',
  '  },',
  '}',
  '```',
  '',
  'Streaming, stop, markdown, and message actions all keep working unchanged.',
].join('\n')

function fallbackAnswer(context: AssistantScreenContext | undefined): string {
  const suggestions = contextualAssistantSuggestions(context)
  return [
    "I'm the parts-bin demo assistant — I can answer from the live sample data:",
    '',
    ...suggestions.map((s) => `- ${s}`),
    '',
    'Try one of those, or click a suggestion chip.',
  ].join('\n')
}

/**
 * First match wins, top to bottom. Left word boundaries prevent substring
 * over-matches ('api' in "rapid", 'risk' in "asterisk") while keeping
 * intentional prefix matches ('churn' → "churned", 'grow' → "growth").
 */
function route(
  text: string,
  accounts: Account[],
  context: AssistantScreenContext | undefined,
  actions: AssistantActions | undefined,
): string {
  const q = text.toLowerCase()
  if (/\b(saved view|view)\b/.test(q) && /\b(create|save|make)\b/.test(q)) return createSavedViewAnswer(text, context, actions)
  if (/\bselected\b/.test(q) && /\b(account|row|summar)/.test(q)) return selectedAccountsAnswer(context)
  if (/\b(current screen|screen context|where am i|summarize the current screen)\b/.test(q)) return screenAnswer(context)
  if (/\bmovement\b/.test(q) || /\bbridge\b/.test(q)) return revenueMovementAnswer(accounts, context)
  if (/\bmrr/.test(q) || /\brevenue/.test(q) || /\bvalue\b/.test(q)) return mrrAnswer(accounts, context)
  if (/\brisk/.test(q) || /\bchurn/.test(q) || /\breview\b/.test(q)) return riskAnswer(accounts, context)
  if (/\bgrow/.test(q) || /\bchange\b/.test(q)) return growthAnswer(accounts, context)
  if (/\bintegrat/.test(q) || /\badapter/.test(q) || /\bapi\b/.test(q) || /\bcode\b/.test(q)) return INTEGRATE_ANSWER
  return fallbackAnswer(context)
}

/**
 * Zero-setup simulated assistant. Answers are computed at send-time from
 * `getAccounts()`, so they track live CRUD edits. `delayMs` is the base
 * inter-chunk delay (jittered ±50%); pass 0 in tests for microtask streams.
 */
export function createDemoAdapter(getAccounts: () => Account[], opts?: DemoAdapterOptions): ChatAdapter {
  const delayMs = opts?.delayMs ?? 24
  return {
    async *send(messages, { signal }) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')
      const answer = route(lastUser?.content ?? '', getAccounts(), opts?.getContext?.(), opts?.actions)
      const chunks = answer.match(/\S+\s*/g) ?? []
      for (const chunk of chunks) {
        if (signal.aborted) return
        if (delayMs > 0) await sleep(delayMs * (0.5 + Math.random()))
        if (signal.aborted) return
        yield chunk
      }
    },
  }
}
