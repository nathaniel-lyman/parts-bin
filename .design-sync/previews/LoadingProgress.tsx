import { LoadingProgress } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 320, padding: 12 }}>
      <LoadingProgress label="Syncing" detail="Syncing records" />
    </div>
  )
}
