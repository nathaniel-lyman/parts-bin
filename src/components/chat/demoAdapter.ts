import type { Account } from '../../data/types'
import { atRiskCount, avgGrowth, segmentShares, totalMrr } from '../../selectors/metrics'
import { fmtCurrency, fmtPercent } from '../../lib/format'
import type { ChatAdapter } from './types'

/** One prompt per demo route; the panel renders these as suggestion chips. */
export const DEMO_SUGGESTIONS = [
  'How is MRR looking?',
  'Which accounts are at risk?',
  'What is our average growth?',
  'How do I integrate a real model?',
]

export type AssistantRouteKind =
  | 'accounts'
  | 'customer-success'
  | 'recommendation-review'
  | 'components'
  | 'composer'
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
}

export type RecommendationFeedbackAction = 'accept' | 'modify' | 'reject' | 'flag'

export interface AssistantActionResult {
  title: string
  body: string
}

export interface AssistantActions {
  createSavedView?: (name: string) => AssistantActionResult
  draftTouchpointNote?: () => AssistantActionResult
  fillRecommendationFeedback?: (action: RecommendationFeedbackAction) => AssistantActionResult
}

export interface DemoAdapterOptions {
  delayMs?: number
  getContext?: () => AssistantScreenContext | undefined
  actions?: AssistantActions
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// fmtPercent takes Math.abs, so restore the sign explicitly.
const signedPercent = (n: number) => `${n < 0 ? '-' : ''}${fmtPercent(n)}`

function mrrAnswer(accounts: Account[]): string {
  const shares = segmentShares(accounts)
  const total = shares.reduce((sum, s) => sum + s.value, 0)
  const rows = shares.map(
    (s) => `| ${s.segment} | ${fmtCurrency(s.value)} | ${total ? ((s.value / total) * 100).toFixed(1) : '0.0'}% |`,
  )
  return [
    `Total MRR is **${fmtCurrency(totalMrr(accounts))}** across non-churned accounts.`,
    '',
    '| Segment | MRR | Share |',
    '| --- | --- | --- |',
    ...rows,
    '',
    'Churned accounts are excluded from these figures, matching the dashboard KPIs.',
  ].join('\n')
}

function riskAnswer(accounts: Account[]): string {
  const atRisk = accounts.filter((a) => a.status !== 'Active')
  if (!atRisk.length) return 'No accounts are currently at risk — every account is **Active**.'
  return [
    `**${atRiskCount(accounts)}** of ${accounts.length} accounts need attention:`,
    '',
    ...atRisk.map((a) => `- **${a.name}** — ${a.status}, ${fmtCurrency(a.mrr)} MRR`),
  ].join('\n')
}

function growthAnswer(accounts: Account[]): string {
  const top = [...accounts].sort((a, b) => b.growth - a.growth).slice(0, 3)
  return [
    `Average growth across all accounts is **${signedPercent(avgGrowth(accounts))}**.`,
    '',
    'Top growers:',
    ...top.map((a) => `- **${a.name}** — ${signedPercent(a.growth)}`),
  ].join('\n')
}

function actionAnswer(result: AssistantActionResult): string {
  return [`**${result.title}**`, '', result.body].join('\n')
}

function compactAccountList(accounts: Account[]): string[] {
  return accounts.map((account) => (
    `- **${account.name}** - ${account.status}, ${fmtCurrency(account.mrr)} MRR, ${signedPercent(account.growth)} growth, owner ${account.owner}`
  ))
}

function screenAnswer(context: AssistantScreenContext | undefined): string {
  if (!context) {
    return 'I do not have screen context yet. Open the assistant from inside the Ledger app shell so I can read the active route and grid state.'
  }
  const lines = [
    `You are on **${context.routeLabel}** (${context.route}).`,
  ]
  if (context.activeTemplate) lines.push(`Active template: **${context.activeTemplate}**.`)
  if (context.timePeriodLabel) lines.push(`Time period: **${context.timePeriodLabel}**.`)
  if (context.globalSearch?.trim()) lines.push(`Global search: **${context.globalSearch.trim()}**.`)
  if (context.atRiskOnly) lines.push('Risk focus is enabled.')
  if (context.grid) {
    const grid = context.grid
    lines.push(`${grid.visibleRowCount} of ${grid.totalRowCount} grid rows are visible, with ${grid.selectedRowCount} selected.`)
    if (grid.quickFilter.trim()) lines.push(`Grid quick filter: **${grid.quickFilter.trim()}**.`)
    if (grid.columnFilters.length) lines.push(`Column filters: ${grid.columnFilters.map((filter) => `${filter.id}=${filter.value}`).join(', ')}.`)
    if (grid.currentSavedViewName) lines.push(`Current saved view: **${grid.currentSavedViewName}**.`)
    else if (grid.savedViews.length) lines.push(`Saved views available: ${grid.savedViews.map((view) => view.name).join(', ')}.`)
  }
  return lines.join('\n')
}

function selectedAccountsAnswer(context: AssistantScreenContext | undefined): string {
  const selected = context?.grid?.selectedAccounts ?? []
  if (!context?.grid) return 'Open the account grid first, then select rows and ask me to summarize them.'
  if (!selected.length) return 'No account rows are selected. Select one or more accounts in the grid and I will summarize just those rows.'
  const selectedMrr = totalMrr(selected)
  return [
    `You selected **${selected.length}** account${selected.length === 1 ? '' : 's'} totaling **${fmtCurrency(selectedMrr)}** active MRR.`,
    '',
    ...compactAccountList(selected),
  ].join('\n')
}

function revenueMovementAnswer(accounts: Account[], context: AssistantScreenContext | undefined): string {
  const scoped = context?.grid?.visibleAccounts ?? accounts
  const sortedByMrr = [...scoped].sort((a, b) => b.mrr - a.mrr)
  const contraction = scoped.filter((account) => account.growth < 0)
  const expansion = scoped.filter((account) => account.growth > 0)
  return [
    `For the current screen scope, active MRR is **${fmtCurrency(totalMrr(scoped))}** across ${scoped.length} visible accounts.`,
    '',
    `Expansion signal: **${expansion.length}** accounts are growing; contraction signal: **${contraction.length}** accounts are negative or churned.`,
    '',
    'Largest visible MRR contributors:',
    ...compactAccountList(sortedByMrr.slice(0, 3)),
    '',
    context?.grid?.quickFilter || context?.grid?.globalSearch || context?.grid?.atRiskOnly
      ? 'This explanation is scoped to the current filters.'
      : 'No grid or shell filters are currently narrowing the account scope.',
  ].join('\n')
}

function savedViewName(context: AssistantScreenContext | undefined): string {
  const grid = context?.grid
  if (!grid) return 'Assistant view'
  const bits: string[] = []
  if (grid.atRiskOnly) bits.push('Risk focus')
  if (grid.quickFilter.trim()) bits.push(`Quick filter ${grid.quickFilter.trim()}`)
  if (grid.globalSearch.trim()) bits.push(`Search ${grid.globalSearch.trim()}`)
  if (!bits.length) bits.push('Current accounts')
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
  if (!context?.grid) return 'Open the account grid first and I can save the current columns, filters, sort, density, and page size as a view.'
  if (!actions?.createSavedView) return 'This assistant can describe the current grid, but no saved-view action is registered on this screen.'
  return actionAnswer(actions.createSavedView(extractNamedView(text) ?? savedViewName(context)))
}

function touchpointAnswer(actions: AssistantActions | undefined): string {
  if (!actions?.draftTouchpointNote) {
    return [
      'Draft touchpoint note:',
      '',
      '**Title:** Executive sponsor follow-up',
      '',
      '**Notes:** Confirm the next milestone, decision owner, and renewal risk before the weekly review.',
    ].join('\n')
  }
  return actionAnswer(actions.draftTouchpointNote())
}

function recommendationAction(text: string): RecommendationFeedbackAction {
  const q = text.toLowerCase()
  if (/\baccept/.test(q)) return 'accept'
  if (/\breject/.test(q)) return 'reject'
  if (/\bflag/.test(q)) return 'flag'
  return 'modify'
}

function recommendationFeedbackAnswer(text: string, actions: AssistantActions | undefined): string {
  if (!actions?.fillRecommendationFeedback) {
    return 'Open the recommendation review template and I can prepare a feedback drawer for the selected recommendation.'
  }
  return actionAnswer(actions.fillRecommendationFeedback(recommendationAction(text)))
}

export function contextualAssistantSuggestions(context: AssistantScreenContext | undefined): string[] {
  if (!context) return DEMO_SUGGESTIONS
  if (context.routeKind === 'accounts') {
    const selected = context.grid?.selectedRowCount ?? 0
    return [
      selected ? `Summarize ${selected} selected account${selected === 1 ? '' : 's'}` : 'Summarize selected accounts',
      'Create a saved view for this screen',
      'Explain this revenue movement',
      'Which accounts are at risk?',
    ]
  }
  if (context.routeKind === 'customer-success') {
    return [
      'Draft this touchpoint note',
      'Summarize the current screen',
      'Which accounts are at risk?',
      'Create a saved view for this screen',
    ]
  }
  if (context.routeKind === 'recommendation-review') {
    return [
      'Fill recommendation feedback',
      'Summarize the current screen',
      'How do I integrate a real model?',
      'Explain this revenue movement',
    ]
  }
  return [
    'Summarize the current screen',
    'How do I integrate a real model?',
    'How is MRR looking?',
    'Which accounts are at risk?',
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
    "I'm the Ledger demo assistant — I can answer from the live account book:",
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
  if (/\btouchpoint\b/.test(q) || /\bdraft\b.*\bnote\b/.test(q)) return touchpointAnswer(actions)
  if (/\bfeedback\b/.test(q) || /\brecommendation\b/.test(q)) return recommendationFeedbackAnswer(text, actions)
  if (/\b(current screen|screen context|where am i|summarize the current screen)\b/.test(q)) return screenAnswer(context)
  if (/\bmovement\b/.test(q) || /\bbridge\b/.test(q)) return revenueMovementAnswer(accounts, context)
  if (/\bmrr/.test(q) || /\brevenue/.test(q)) return mrrAnswer(accounts)
  if (/\brisk/.test(q) || /\bchurn/.test(q)) return riskAnswer(accounts)
  if (/\bgrow/.test(q)) return growthAnswer(accounts)
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
