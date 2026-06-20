import { FacetedFilter } from 'parts-bin'

const noop = () => {}

export function Closed() {
  return (
    <div style={{ width: 360, minHeight: 56 }}>
      <FacetedFilter
        label="Segment"
        options={[
          { value: 'enterprise', label: 'Enterprise', count: 12 },
          { value: 'mid-market', label: 'Mid-market', count: 24 },
          { value: 'startup', label: 'Startup', count: 31 },
        ]}
        selectedValues={['enterprise', 'startup']}
        onSelectedValuesChange={noop}
      />
    </div>
  )
}

export function NoSelection() {
  return (
    <div style={{ width: 360, minHeight: 56 }}>
      <FacetedFilter
        label="Status"
        options={[
          { value: 'active', label: 'Active', count: 42 },
          { value: 'at-risk', label: 'At risk', count: 7 },
          { value: 'churned', label: 'Churned', count: 3 },
        ]}
        selectedValues={[]}
        onSelectedValuesChange={noop}
      />
    </div>
  )
}
