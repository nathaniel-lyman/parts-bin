import { PropertyGrid } from 'parts-bin'

export function ResourceProperties() {
  return (
    <div style={{ width: 480 }}>
      <PropertyGrid
        items={[
          { label: 'Region', value: 'us-east-1' },
          { label: 'Instance', value: 'm6i.xlarge' },
          { label: 'Seats', value: '60' },
          { label: 'Status', value: 'Running' },
          { label: 'Uptime', value: '99.98%' },
          { label: 'Version', value: 'v2.4.0' },
        ]}
        columns={3}
      />
    </div>
  )
}

export function TwoColumns() {
  return (
    <div style={{ width: 480 }}>
      <PropertyGrid
        items={[
          { label: 'Plan', value: 'Enterprise' },
          { label: 'MRR', value: '$4,200' },
          { label: 'Owner', value: 'Avery Chen' },
          { label: 'Renews', value: 'Aug 2026' },
        ]}
        columns={2}
      />
    </div>
  )
}
