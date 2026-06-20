import { StatusBadge } from 'parts-bin'

export function Tones() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <StatusBadge status="Active" tone="pos" />
      <StatusBadge status="At risk" tone="warn" />
      <StatusBadge status="Churned" tone="neg" />
      <StatusBadge status="Trial" tone="accent" />
      <StatusBadge status="Draft" tone="neutral" />
    </div>
  )
}

export function Default() {
  return <StatusBadge status="Pending review" />
}
