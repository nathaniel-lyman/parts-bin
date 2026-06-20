import { Toast } from 'parts-bin'

export function Tones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
      <Toast tone="pos" title="Account saved" onDismiss={() => {}}>
        Northwind Logistics moved to the Pro plan.
      </Toast>
      <Toast tone="accent" title="Export ready" onDismiss={() => {}}>
        Your accounts export (142 rows) finished.
      </Toast>
      <Toast tone="warn" title="Renewal due" onDismiss={() => {}}>
        Acme Robotics renews in 3 days.
      </Toast>
      <Toast tone="neg" title="Sync failed" onDismiss={() => {}}>
        Couldn't reach Salesforce for 2 accounts.
      </Toast>
    </div>
  )
}

export function WithAction() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Toast
        tone="accent"
        title="Account deleted"
        onDismiss={() => {}}
        action={{ label: 'Undo', onClick: () => {} }}
      >
        Lumen Studio was removed from the view.
      </Toast>
    </div>
  )
}
