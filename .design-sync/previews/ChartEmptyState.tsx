import { ChartEmptyState } from 'parts-bin'

// The no-data placeholder shown in a chart slot when filters exclude every row.
export function Default() {
  return (
    <div style={{ width: 380 }}>
      <ChartEmptyState />
    </div>
  )
}

export function Filtered() {
  return (
    <div style={{ width: 380 }}>
      <ChartEmptyState
        title="No revenue in range"
        description="No movement matched the selected segment and date range."
      />
    </div>
  )
}
