import { KeyValueList } from 'parts-bin'

export function AccountDetails() {
  return (
    <div style={{ width: 440 }}>
      <KeyValueList
        items={[
          { label: 'Owner', value: 'Avery Chen' },
          { label: 'Plan', value: 'Enterprise' },
          { label: 'MRR', value: '$4,200' },
          { label: 'Seats', value: '60' },
          { label: 'Renews', value: 'Aug 2026' },
        ]}
      />
    </div>
  )
}

export function WithDescriptions() {
  return (
    <div style={{ width: 440 }}>
      <KeyValueList
        items={[
          { label: 'Status', value: 'Active', description: 'In good standing since Jan 2026.' },
          { label: 'Health score', value: '82 / 100', description: 'Up 6 points this quarter.' },
          { label: 'Primary contact', value: 'priya.nair@northwind.com', description: 'VP of Operations' },
        ]}
      />
    </div>
  )
}
