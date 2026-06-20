import { ActivityFeed } from 'parts-bin'

export function AccountActivity() {
  return (
    <div style={{ width: 440 }}>
      <ActivityFeed
        title="Recent activity"
        items={[
          {
            id: 'e1',
            title: 'Plan upgraded to Enterprise',
            actor: 'Avery Chen',
            description: 'Seats increased from 38 to 60.',
            timestamp: '2m ago',
            tone: 'positive',
          },
          {
            id: 'e2',
            title: 'Invoice paid',
            actor: 'Billing',
            description: '$4,200 for March 2026.',
            timestamp: '1h ago',
            tone: 'accent',
          },
          {
            id: 'e3',
            title: 'Owner reassigned',
            actor: 'Marcus Webb',
            description: 'Account owner set to Priya Nair.',
            timestamp: 'Yesterday',
          },
        ]}
      />
    </div>
  )
}

export function WithStatusTones() {
  return (
    <div style={{ width: 440 }}>
      <ActivityFeed
        title="System events"
        items={[
          { id: 's1', title: 'Renewal completed', actor: 'Northwind Traders', timestamp: '10:24', tone: 'positive' },
          { id: 's2', title: 'Usage limit at 85%', actor: 'Globex Corp', timestamp: '09:50', tone: 'warning' },
          { id: 's3', title: 'Payment failed', actor: 'Initech', timestamp: '08:12', tone: 'negative' },
        ]}
      />
    </div>
  )
}
