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

function fallbackAnswer(): string {
  return [
    "I'm the Ledger demo assistant — I can answer from the live account book:",
    '',
    ...DEMO_SUGGESTIONS.map((s) => `- ${s}`),
    '',
    'Try one of those, or click a suggestion chip.',
  ].join('\n')
}

/**
 * First match wins, top to bottom. Left word boundaries prevent substring
 * over-matches ('api' in "rapid", 'risk' in "asterisk") while keeping
 * intentional prefix matches ('churn' → "churned", 'grow' → "growth").
 */
function route(text: string, accounts: Account[]): string {
  const q = text.toLowerCase()
  if (/\bmrr/.test(q) || /\brevenue/.test(q)) return mrrAnswer(accounts)
  if (/\brisk/.test(q) || /\bchurn/.test(q)) return riskAnswer(accounts)
  if (/\bgrow/.test(q)) return growthAnswer(accounts)
  if (/\bintegrat/.test(q) || /\badapter/.test(q) || /\bapi\b/.test(q) || /\bcode\b/.test(q)) return INTEGRATE_ANSWER
  return fallbackAnswer()
}

/**
 * Zero-setup simulated assistant. Answers are computed at send-time from
 * `getAccounts()`, so they track live CRUD edits. `delayMs` is the base
 * inter-chunk delay (jittered ±50%); pass 0 in tests for microtask streams.
 */
export function createDemoAdapter(getAccounts: () => Account[], opts?: { delayMs?: number }): ChatAdapter {
  const delayMs = opts?.delayMs ?? 24
  return {
    async *send(messages, { signal }) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')
      const answer = route(lastUser?.content ?? '', getAccounts())
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
