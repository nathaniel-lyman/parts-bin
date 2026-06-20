import { KpiCard } from 'parts-bin'

export function PositiveTrend() {
  return (
    <div style={{ width: 280 }}>
      <KpiCard label="Total MRR" value="$284K" delta={4.6} spark={[238, 245, 251, 260, 268, 277, 284]} />
    </div>
  )
}

export function NegativeTrend() {
  return (
    <div style={{ width: 280 }}>
      <KpiCard label="Needs review" value="7" delta={-12.5} spark={[14, 13, 12, 11, 9, 8, 7]} negSpark />
    </div>
  )
}

export function NoSparkline() {
  return (
    <div style={{ width: 280 }}>
      <KpiCard label="Active accounts" value="42" delta={2.4} />
    </div>
  )
}
