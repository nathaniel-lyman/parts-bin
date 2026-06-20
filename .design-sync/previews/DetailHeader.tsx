import { DetailHeader, StatusBadge, Button } from 'parts-bin'

export function AccountHeader() {
  return (
    <div style={{ width: 480 }}>
      <DetailHeader
        title="Northwind Traders"
        subtitle="Enterprise · 60 seats · renews Aug 2026"
        status={<StatusBadge status="Active" tone="pos" />}
        meta={
          <>
            <span>Owner: Avery Chen</span>
            <span>Region: North America</span>
            <span>ID: ACC-10428</span>
          </>
        }
        actions={
          <>
            <Button variant="secondary" size="compact">Edit</Button>
            <Button variant="primary" size="compact">Contact</Button>
          </>
        }
      />
    </div>
  )
}

export function Minimal() {
  return (
    <div style={{ width: 480 }}>
      <DetailHeader title="Project Alpha" subtitle="Operations workspace" />
    </div>
  )
}
