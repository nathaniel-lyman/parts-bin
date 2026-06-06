import type { ReactNode } from 'react'
type Tone = 'accent' | 'pos' | 'neg' | 'warn'
const edge: Record<Tone, string> = { accent: 'border-l-accent', pos: 'border-l-pos', neg: 'border-l-neg', warn: 'border-l-warn' }
export function Toast({ tone = 'accent', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={`shadow-dropdown min-w-56 rounded-[2px] border border-line border-l-2 bg-surface px-3 py-2 text-[13px] text-ink ${edge[tone]}`}>
      {children}
    </div>
  )
}
