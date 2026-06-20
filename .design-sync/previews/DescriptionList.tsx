import { DescriptionList } from 'parts-bin'

const fields = [
  { label: 'Owner', value: 'Avery Chen' },
  { label: 'Plan', value: 'Enterprise' },
  { label: 'MRR', value: '$4,200' },
  { label: 'Seats', value: '60' },
  { label: 'Region', value: 'North America' },
  { label: 'Renews', value: 'Aug 2026' },
]

export function TwoColumns() {
  return (
    <div style={{ width: 480 }}>
      <DescriptionList items={fields} columns={2} />
    </div>
  )
}

export function ThreeColumns() {
  return (
    <div style={{ width: 480 }}>
      <DescriptionList items={fields} columns={3} />
    </div>
  )
}

export function SingleColumn() {
  return (
    <div style={{ width: 320 }}>
      <DescriptionList
        items={[
          { label: 'Primary contact', value: 'Priya Nair', description: 'VP of Operations' },
          { label: 'Billing email', value: 'billing@northwind.com' },
        ]}
        columns={1}
      />
    </div>
  )
}
