import { Timeline } from 'parts-bin'

export function AccountLifecycle() {
  return (
    <div style={{ width: 440 }}>
      <Timeline
        items={[
          {
            id: 't1',
            title: 'Account created',
            description: 'Northwind Traders signed up on the Starter plan.',
            timestamp: 'Jan 2026',
          },
          {
            id: 't2',
            title: 'Upgraded to Pro',
            description: 'Expanded to 24 seats.',
            timestamp: 'Mar 2026',
            tone: 'accent',
          },
          {
            id: 't3',
            title: 'Upgraded to Enterprise',
            description: 'Annual contract, 60 seats.',
            timestamp: 'Jun 2026',
            tone: 'positive',
          },
        ]}
      />
    </div>
  )
}

export function DeploymentHistory() {
  return (
    <div style={{ width: 440 }}>
      <Timeline
        items={[
          { id: 'd1', title: 'v2.4.0 released', description: 'Saved views and column pinning.', timestamp: '14:02', tone: 'positive' },
          { id: 'd2', title: 'Rollback to v2.3.1', description: 'Regression in CSV export.', timestamp: '11:30', tone: 'negative' },
          { id: 'd3', title: 'v2.3.1 deployed', description: 'Routine maintenance release.', timestamp: '09:15' },
        ]}
      />
    </div>
  )
}
