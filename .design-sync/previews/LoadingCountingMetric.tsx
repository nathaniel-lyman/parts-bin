import { LoadingCountingMetric } from 'parts-bin'

export function Currency() {
  return (
    <div style={{ width: 220, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingCountingMetric label="Loading metric" metricLabel="Total MRR" target={78300} />
    </div>
  )
}
