import type { ReactNode } from 'react'
import { fmtDelta } from '../lib/format'

interface Props { label: string; value: string; delta?: number; spark?: ReactNode }

export function KpiCard({ label, value, delta, spark }: Props) {
  const deltaClass = delta == null ? '' : delta < 0 ? 'text-neg' : 'text-pos'
  return (
    <div className="rounded-[2px] border border-line bg-surface p-4">
      <div className="micro">{label}</div>
      <div className="num display mt-1 text-2xl text-ink">{value}</div>
      <div className="mt-1 flex items-center justify-between">
        {delta != null && <span className={`num text-[12px] ${deltaClass}`}>{fmtDelta(delta)}</span>}
        {spark}
      </div>
    </div>
  )
}
