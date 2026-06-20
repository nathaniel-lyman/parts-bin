import { SectionHeader, Button } from 'parts-bin'

// SectionHeader: a titled section header with optional description + actions.
export function WithActions() {
  return (
    <div style={{ width: 640, padding: 16 }}>
      <SectionHeader
        title="Accounts by segment"
        description="Live MRR breakdown across all active accounts."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="compact">Export</Button>
            <Button variant="primary" size="compact">New account</Button>
          </div>
        }
      />
    </div>
  )
}

export function TitleAndDescription() {
  return (
    <div style={{ width: 640, padding: 16 }}>
      <SectionHeader
        title="Renewal risk"
        description="Accounts with renewals due in the next 90 days."
      />
    </div>
  )
}
