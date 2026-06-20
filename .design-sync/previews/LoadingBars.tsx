import { LoadingBars } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 200, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingBars label="Loading activity" />
    </div>
  )
}
