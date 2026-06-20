import { Card, Button, StatusBadge } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 360 }}>
      <Card title="Overview" description="Quarterly account summary">
        <p style={{ margin: 0, fontSize: 13 }}>
          MRR is up 4.2% this quarter, driven by Enterprise expansions.
        </p>
      </Card>
    </div>
  )
}

export function WithActionsAndFooter() {
  return (
    <div style={{ width: 360 }}>
      <Card
        title="Acme Corp"
        description="Enterprise · renews Aug 2026"
        actions={<StatusBadge status="Active" tone="pos" />}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="compact">View</Button>
            <Button variant="primary" size="compact">Edit</Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: 13 }}>$4,200 MRR across 38 seats.</p>
      </Card>
    </div>
  )
}

export function BodyOnly() {
  return (
    <div style={{ width: 360 }}>
      <Card>
        <p style={{ margin: 0, fontSize: 13 }}>
          A bare card with no header — just padded, surface-tinted content.
        </p>
      </Card>
    </div>
  )
}
