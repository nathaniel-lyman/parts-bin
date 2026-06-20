import { GeoDrilldown } from 'parts-bin'

export function RegionalDrilldown() {
  return (
    <div style={{ width: 760 }}>
      <GeoDrilldown
        title="Regional drilldown"
        description="Select a region to filter KPIs, charts, and grid rows."
      />
    </div>
  )
}
