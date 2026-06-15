import { describe, expect, test } from 'vitest'
import {
  contextualAssistantSuggestions,
  createDemoAdapter,
  DEMO_SUGGESTIONS,
  type AssistantScreenContext,
} from './demoAdapter'
import { buildAssistantDashboardEvidence } from './dashboardEvidence'
import { totalMrr } from '../../selectors/metrics'
import { fmtCurrency } from '../../lib/format'
import type { Account } from '../../data/types'
import type { ChatAdapter, ChatMessageData } from './types'

const fixture: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Kim', segment: 'Enterprise', mrr: 1000, growth: 10, status: 'Active', arr: 12000, since: '2024-01-01' },
  { id: 'a2', name: 'Globex', owner: 'Lee', segment: 'Startup', mrr: 200, growth: -30, status: 'At risk', arr: 2400, since: '2024-02-01' },
  { id: 'a3', name: 'Initech', owner: 'Kim', segment: 'Mid-market', mrr: 500, growth: -40, status: 'Churned', arr: 6000, since: '2024-03-01' },
]

const userMsg = (content: string): ChatMessageData[] => [
  { id: 'u1', role: 'user', content, status: 'done' },
]

const screenContext: AssistantScreenContext = {
  route: '/',
  routeLabel: 'Accounts',
  routeKind: 'accounts',
  globalSearch: 'kim',
  atRiskOnly: false,
  timePeriodLabel: 'Last 90 days',
  dashboardEvidence: buildAssistantDashboardEvidence({
    revenueMovementData: [
      { month: 'Jan', New: 2, Expansion: 1, Churn: -4 },
      { month: 'Feb', New: 5, Expansion: 2, Churn: -1 },
      { month: 'Mar', New: 1.5, Expansion: 1.5, Churn: -0.5 },
    ],
    sourceTitle: 'Revenue movement ($k)',
    timePeriodLabel: 'Last 90 days',
    barWidth: 22,
    labelsVisible: false,
  }),
  grid: {
    visibleAccounts: fixture.slice(0, 2),
    selectedAccounts: [fixture[1]],
    totalRowCount: 3,
    visibleRowCount: 2,
    selectedRowCount: 1,
    globalSearch: 'kim',
    quickFilter: 'startup',
    atRiskOnly: false,
    timePeriodLabel: 'Last 90 days',
    columnFilters: [{ id: 'segment', value: 'Startup' }],
    sorting: [{ id: 'mrr', desc: true }],
    savedViews: [{ id: 'view-1', name: 'Risk queue' }],
    currentSavedViewName: 'Risk queue',
  },
}

async function collect(adapter: ChatAdapter, text: string): Promise<string> {
  const controller = new AbortController()
  let out = ''
  for await (const t of adapter.send(userMsg(text), { signal: controller.signal })) out += t
  return out
}

describe('createDemoAdapter', () => {
  const adapter = createDemoAdapter(() => fixture, { delayMs: 0 })

  test('mrr route streams the real total and a segment share table', async () => {
    const out = await collect(adapter, 'How is MRR looking?')
    expect(out).toContain(fmtCurrency(totalMrr(fixture))) // $1,200 — Churned excluded
    expect(out).toContain('| Segment | MRR | Share |')
    expect(out).toContain('Enterprise')
    expect(out).toContain('83.3%') // 1000/1200
    expect(out).toContain('Evidence used')
    expect(out).toContain('active MRR excludes Churned accounts')
  })

  test('risk route lists non-Active accounts', async () => {
    const out = await collect(adapter, 'which accounts churned?')
    expect(out).toContain('**2**')
    expect(out).toContain('Globex')
    expect(out).toContain('Initech')
    expect(out).not.toContain('Acme')
    expect(out).toContain('Evidence used')
    expect(out).toContain('At risk and Churned statuses')
  })

  test('growth route sign-prefixes a negative average', async () => {
    const out = await collect(adapter, 'how is growth?')
    // avgGrowth = (10 - 30 - 40) / 3 = -20 ; fmtPercent abs()'s, adapter restores the sign
    expect(out).toContain('-20.0%')
    expect(out).toContain('Evidence used')
    expect(out).toContain('average growth includes all scoped accounts')
  })

  test('integrate route emits a fenced code block', async () => {
    const out = await collect(adapter, 'how do I integrate a real model?')
    expect(out).toContain('```ts')
    expect(out).toContain('ChatAdapter')
  })

  test('unknown question falls back to the capability list', async () => {
    const out = await collect(adapter, 'what is the weather?')
    expect(out.toLowerCase()).toContain('i can answer')
  })

  test('abort stops the stream early', async () => {
    const controller = new AbortController()
    const iterator = adapter.send(userMsg('mrr'), { signal: controller.signal })[Symbol.asyncIterator]()
    const first = await iterator.next()
    expect(first.done).toBe(false)
    controller.abort()
    const next = await iterator.next()
    expect(next.done).toBe(true)
  })

  test('reads accounts per call, so answers track live data', async () => {
    const live: Account[] = [...fixture]
    const liveAdapter = createDemoAdapter(() => live, { delayMs: 0 })
    const before = await collect(liveAdapter, 'mrr')
    live.push({ id: 'a4', name: 'Umbrella', owner: 'Ada', segment: 'Enterprise', mrr: 800, growth: 5, status: 'Active', arr: 9600, since: '2024-04-01' })
    const after = await collect(liveAdapter, 'mrr')
    expect(before).toContain(fmtCurrency(1200))
    expect(after).toContain(fmtCurrency(2000))
  })

  test('summarizes selected accounts from screen context', async () => {
    const contextualAdapter = createDemoAdapter(() => fixture, { delayMs: 0, getContext: () => screenContext })
    const out = await collect(contextualAdapter, 'summarize selected accounts')
    expect(out).toContain('You selected **1** account')
    expect(out).toContain('Globex')
    expect(out).not.toContain('Acme')
    expect(out).toContain('Evidence used')
    expect(out).toContain('Selection source: DataGrid selected rows')
  })

  test('explains revenue movement with chart and grid evidence separated', async () => {
    const contextualAdapter = createDemoAdapter(() => fixture, { delayMs: 0, getContext: () => screenContext })
    const out = await collect(contextualAdapter, 'Explain this revenue movement')

    expect(out).toContain('Revenue movement is **net positive**')
    expect(out).toContain('$7.5k net')
    expect(out).toContain('Latest visible month: **Mar**')
    expect(out).toContain('Chart: Revenue movement ($k), 3 monthly rows, Last 90 days')
    expect(out).toContain('Grid scope: 2 of 3 rows visible, 1 row selected')
    expect(out).toContain('Separation: chart evidence uses dashboard monthly movement data; grid evidence uses currently visible account rows.')
  })

  test('screen summary exposes missing evidence when no context is available', async () => {
    const out = await collect(adapter, 'Summarize the current screen')

    expect(out).toContain('I do not have screen context yet')
    expect(out).toContain('Evidence used')
    expect(out).toContain('No route, chart, or grid evidence is available')
  })

  test('creates a saved view through the registered screen action', async () => {
    let savedName = ''
    const contextualAdapter = createDemoAdapter(() => fixture, {
      delayMs: 0,
      getContext: () => screenContext,
      actions: {
        createSavedView: (name) => {
          savedName = name
          return { title: 'Saved view created', body: `Saved ${name}.` }
        },
      },
    })

    const out = await collect(contextualAdapter, 'create a saved view called "Startup watch"')
    expect(savedName).toBe('Startup watch')
    expect(out).toContain('Saved view created')
  })

  test('contextual suggestions reflect selected grid rows', () => {
    expect(contextualAssistantSuggestions(screenContext)[0]).toBe('Summarize 1 selected account')
  })

  test('exports one suggestion per route', () => {
    expect(DEMO_SUGGESTIONS).toHaveLength(4)
  })
})
