import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { fmtDelta } from '../lib/format'
import { Sparkline } from './Sparkline'
import { cx } from './ui/utils'

interface KpiSummaryRowProps {
  children: ReactNode
  className?: string
}

export function KpiSummaryRow({ children, className }: KpiSummaryRowProps) {
  return (
    <div className={cx('mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  )
}

interface Props {
  label: string
  value: string
  delta?: number
  /** 12-point trend series for the sparkline */
  spark?: number[]
  /** render the sparkline in the negative token (for declining/at-risk metrics) */
  negSpark?: boolean
}

export function KpiCard({ label, value, delta, spark, negSpark }: Props) {
  const deltaClass = delta == null ? '' : delta < 0 ? 'text-neg' : 'text-pos'
  const DeltaIcon = delta != null && delta < 0 ? ArrowDown : ArrowUp
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="micro">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="num display text-2xl leading-none text-ink">{value}</div>
          {delta != null && (
            <div className="mt-1.5">
              <span className={`num inline-flex items-center gap-0.5 text-[12px] ${deltaClass}`}>
                <DeltaIcon aria-hidden="true" className="h-3 w-3" />
                {fmtDelta(delta)}
              </span>{' '}
              <span className="text-[12px] text-faint">vs last mo</span>
            </div>
          )}
        </div>
        {spark && <Sparkline data={spark} neg={negSpark} />}
      </div>
    </div>
  )
}
