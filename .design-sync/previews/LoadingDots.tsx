import { LoadingDots } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 160, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingDots label="Loading" />
    </div>
  )
}
