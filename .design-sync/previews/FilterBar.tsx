import { FilterBar, Button, StatusBadge } from 'parts-bin'

// FilterBar: a horizontal row of filter controls; actions pushed to the right.
export function AccountFilters() {
  return (
    <div style={{ width: 760 }}>
      <FilterBar
        actions={
          <>
            <Button variant="ghost" size="compact">Clear</Button>
            <Button variant="primary" size="compact">Apply</Button>
          </>
        }
      >
        <Button variant="secondary" size="compact">All accounts ▾</Button>
        <StatusBadge status="Active" tone="pos" />
        <StatusBadge status="At risk" tone="warn" />
        <Button variant="secondary" size="compact">Segment: Enterprise</Button>
        <Button variant="secondary" size="compact">Owner: Morgan</Button>
      </FilterBar>
    </div>
  )
}
