import { WaterfallChart } from 'parts-bin'

// Bridge from opening to closing MRR ($k): start, +New, +Expansion, -Contraction, -Churn, total.
const mrrBridge = [
  { label: 'Opening', kind: 'start' as const, value: 72.8, note: 'Starting MRR' },
  { label: 'New', kind: 'increase' as const, value: 7.1 },
  { label: 'Expansion', kind: 'increase' as const, value: 4.0 },
  { label: 'Contraction', kind: 'decrease' as const, value: 1.1 },
  { label: 'Churn', kind: 'decrease' as const, value: 0.5 },
  { label: 'Closing', kind: 'total' as const, note: 'Ending MRR' },
]

export function MrrBridge() {
  return (
    <div style={{ width: 540 }}>
      <WaterfallChart
        data={mrrBridge}
        showLabels
        valueFormatter={(v) => `$${v.toFixed(1)}k`}
        tickFormatter={(v) => `$${v}k`}
      />
    </div>
  )
}
