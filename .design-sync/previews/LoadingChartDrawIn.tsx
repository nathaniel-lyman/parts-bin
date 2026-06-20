import { LoadingChartDrawIn } from 'parts-bin'

export function Accent() {
  return (
    <div style={{ width: 280, height: 120, padding: 8 }}>
      <LoadingChartDrawIn label="Loading chart" tone="accent" />
    </div>
  )
}

export function Positive() {
  return (
    <div style={{ width: 280, height: 120, padding: 8 }}>
      <LoadingChartDrawIn label="Loading chart" tone="pos" />
    </div>
  )
}
