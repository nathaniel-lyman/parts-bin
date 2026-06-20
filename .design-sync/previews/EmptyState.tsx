import { EmptyState, Button } from 'parts-bin'

export function NoResults() {
  return (
    <div style={{ width: 420 }}>
      <EmptyState
        title="No accounts match these filters"
        description="Try widening the date range or clearing the segment filter to see more results."
      />
    </div>
  )
}

export function WithAction() {
  return (
    <div style={{ width: 420 }}>
      <EmptyState
        title="No projects yet"
        description="Create your first project to start tracking revenue and usage."
        action={<Button variant="primary">New project</Button>}
      />
    </div>
  )
}
