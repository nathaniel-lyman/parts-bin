import { RegionChoropleth } from 'parts-bin'

export function RegionsByValue() {
  return (
    <div style={{ width: 520 }}>
      <RegionChoropleth valueLabel="regional MRR" ariaLabel="MRR by US region" />
    </div>
  )
}

export function WestSelected() {
  return (
    <div style={{ width: 520 }}>
      <RegionChoropleth
        selectedRegionId="west"
        valueLabel="regional MRR"
        ariaLabel="MRR by US region, West selected"
      />
    </div>
  )
}
