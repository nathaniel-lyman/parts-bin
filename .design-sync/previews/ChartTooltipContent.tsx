import { ChartTooltipContent } from 'parts-bin'

// The tooltip body composed as a static instance (normally fed by a Recharts cursor).
export function MultiSeries() {
  return (
    <div style={{ width: 260 }}>
      <ChartTooltipContent
        label="October"
        rows={[
          { label: 'Enterprise', value: '$55k', colorClassName: 'bg-accent' },
          { label: 'Mid-market', value: '$24k', colorClassName: 'bg-pos' },
          { label: 'Startup', value: '$4k', colorClassName: 'bg-neg' },
        ]}
        footer="Total $83k MRR"
      />
    </div>
  )
}

// Single-row tooltip — the common hover-over-a-bar case.
export function SingleRow() {
  return (
    <div style={{ width: 220 }}>
      <ChartTooltipContent label="Jul" rows={[{ label: 'New MRR', value: '+$3.9k' }]} />
    </div>
  )
}
