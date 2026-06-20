import { AppliedFiltersBar } from 'parts-bin'

const noop = () => {}

export function ActiveFilters() {
  return (
    <div style={{ width: 520 }}>
      <AppliedFiltersBar
        filters={[
          { id: 'segment', label: 'Segment', value: 'Enterprise', onRemove: noop },
          { id: 'status', label: 'Status', value: 'Active', onRemove: noop },
          { id: 'plan', label: 'Plan', value: 'Pro', onRemove: noop },
        ]}
        onClearAll={noop}
      />
    </div>
  )
}

export function Empty() {
  return (
    <div style={{ width: 520 }}>
      <AppliedFiltersBar filters={[]} />
    </div>
  )
}
