import { PageHeader, Button } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 520 }}>
      <PageHeader
        title="Accounts"
        description="Manage customer accounts, MRR, and renewal risk."
        actions={<Button variant="primary">New account</Button>}
      />
    </div>
  )
}

export function WithEyebrow() {
  return (
    <div style={{ width: 520 }}>
      <PageHeader
        eyebrow="Workspace"
        title="Revenue overview"
        description="A live snapshot of MRR across all active accounts."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary">Export</Button>
            <Button variant="primary">Add widget</Button>
          </div>
        }
      />
    </div>
  )
}
