import { LoadingSparkline } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 220, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSparkline label="Loading sparkline" />
    </div>
  )
}
