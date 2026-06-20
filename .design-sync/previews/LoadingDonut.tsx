import { LoadingDonut } from 'parts-bin'

export function Accent() {
  return (
    <div style={{ width: 160, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingDonut label="Loading donut chart" tone="accent" />
    </div>
  )
}

export function Intel() {
  return (
    <div style={{ width: 160, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingDonut label="Loading donut chart" tone="intel" />
    </div>
  )
}
