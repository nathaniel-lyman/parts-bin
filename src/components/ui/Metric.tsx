import type { ReactNode } from 'react'
import { cx } from './utils'

export interface MetricProps {
  label: ReactNode
  value: ReactNode
  delta?: ReactNode
  status?: 'positive' | 'negative' | 'warning' | 'neutral' | 'intelligence' | 'review' | 'reject'
}

const statusClass: Record<NonNullable<MetricProps['status']>, string> = {
  positive: 'text-pos',
  negative: 'text-neg',
  warning: 'text-warn',
  neutral: 'text-muted',
  intelligence: 'text-intel',
  review: 'text-review',
  reject: 'text-reject',
}

export function Metric({ label, value, delta, status = 'neutral' }: MetricProps) {
  return (
    <div className="grid gap-2 border border-line bg-surface p-4">
      <div className="micro">{label}</div>
      <div className="display text-[24px] font-semibold leading-none text-ink">{value}</div>
      {delta && <div className={cx('num text-[12px]', statusClass[status])}>{delta}</div>}
    </div>
  )
}
