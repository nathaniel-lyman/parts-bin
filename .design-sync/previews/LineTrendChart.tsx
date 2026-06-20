import { LineTrendChart } from 'parts-bin'

// Defaults to the built-in monthly series with Enterprise / Mid-market / Startup lines.
export function Default() {
  return (
    <div style={{ width: 460, height: 240 }}>
      <LineTrendChart />
    </div>
  )
}

export function EndLabels() {
  return (
    <div style={{ width: 520, height: 240 }}>
      <LineTrendChart showEndLabels />
    </div>
  )
}
