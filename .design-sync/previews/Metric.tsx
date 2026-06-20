import { Metric } from 'parts-bin'

export function Statuses() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: 480 }}>
      <Metric label="Total MRR" value="$284K" delta="+4.6% vs last mo" status="positive" />
      <Metric label="Churned MRR" value="$12.4K" delta="-2.1% vs last mo" status="negative" />
      <Metric label="At-risk accounts" value="7" delta="3 need review" status="warning" />
      <Metric label="Active accounts" value="42" status="neutral" />
    </div>
  )
}

export function Single() {
  return (
    <div style={{ width: 240 }}>
      <Metric label="Net revenue retention" value="112%" delta="+5 pts QoQ" status="positive" />
    </div>
  )
}
