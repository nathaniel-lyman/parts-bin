import { LoadingKpiSkeleton } from 'parts-bin'

export function Default() {
  return (
    <div
      style={{
        width: 240,
        padding: 16,
        border: '1px solid var(--line)',
        borderRadius: 10,
      }}
    >
      <LoadingKpiSkeleton label="Loading KPI" />
    </div>
  )
}
