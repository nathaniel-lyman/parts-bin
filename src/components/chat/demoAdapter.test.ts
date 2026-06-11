import { describe, expect, test } from 'vitest'
import { createDemoAdapter, DEMO_SUGGESTIONS } from './demoAdapter'
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
  })

  test('risk route lists non-Active accounts', async () => {
    const out = await collect(adapter, 'which accounts churned?')
    expect(out).toContain('**2**')
    expect(out).toContain('Globex')
    expect(out).toContain('Initech')
    expect(out).not.toContain('Acme')
  })

  test('growth route sign-prefixes a negative average', async () => {
    const out = await collect(adapter, 'how is growth?')
    // avgGrowth = (10 - 30 - 40) / 3 = -20 ; fmtPercent abs()'s, adapter restores the sign
    expect(out).toContain('-20.0%')
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

  test('exports one suggestion per route', () => {
    expect(DEMO_SUGGESTIONS).toHaveLength(4)
  })
})
