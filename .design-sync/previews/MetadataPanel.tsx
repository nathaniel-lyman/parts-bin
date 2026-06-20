import { MetadataPanel } from 'parts-bin'

export function AccountMetadata() {
  return (
    <div style={{ width: 360 }}>
      <MetadataPanel
        title="Metadata"
        items={[
          { label: 'Account ID', value: 'ACC-10428' },
          { label: 'Created', value: 'Jan 12, 2026' },
          { label: 'Created by', value: 'Avery Chen' },
          { label: 'Last edited', value: '2m ago' },
          { label: 'Source', value: 'Salesforce sync' },
        ]}
        footer="Synced automatically every 15 minutes."
      />
    </div>
  )
}

export function NoFooter() {
  return (
    <div style={{ width: 360 }}>
      <MetadataPanel
        title="Deployment"
        items={[
          { label: 'Environment', value: 'production' },
          { label: 'Commit', value: 'a1b2c3d' },
          { label: 'Deployed', value: 'Mar 14, 09:41' },
        ]}
      />
    </div>
  )
}
