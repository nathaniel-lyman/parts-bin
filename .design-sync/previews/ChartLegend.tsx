import { ChartLegend } from 'parts-bin'

// Semantic legend using token-backed colorClassName swatches.
export function Semantic() {
  return (
    <div style={{ width: 320 }}>
      <ChartLegend
        items={[
          { id: 'new', label: 'New', colorClassName: 'bg-pos' },
          { id: 'expansion', label: 'Expansion', colorClassName: 'bg-accent' },
          { id: 'churn', label: 'Churn', colorClassName: 'bg-neg' },
        ]}
      />
    </div>
  )
}

// Legend with per-item values — pairs each segment with its share.
export function WithValues() {
  return (
    <div style={{ width: 360 }}>
      <ChartLegend
        items={[
          { id: 'enterprise', label: 'Enterprise', color: 'var(--accent)', value: '$55k (66%)' },
          { id: 'mid', label: 'Mid-market', color: '#00a6c2', value: '$24k (29%)' },
          { id: 'startup', label: 'Startup', color: '#7c4dff', value: '$4k (5%)' },
        ]}
      />
    </div>
  )
}
