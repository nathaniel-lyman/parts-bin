import { InlineAlert, Button } from 'parts-bin'

export function Tones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 380 }}>
      <InlineAlert tone="accent" title="New version available">Refresh to get the latest dashboard.</InlineAlert>
      <InlineAlert tone="pos" title="Changes saved">Your account settings were updated.</InlineAlert>
      <InlineAlert tone="warn" title="Renewal overdue">This account renews in 2 days.</InlineAlert>
      <InlineAlert tone="neg" title="Payment failed">We couldn't process the last invoice.</InlineAlert>
    </div>
  )
}

export function WithActionAndDismiss() {
  return (
    <div style={{ width: 380 }}>
      <InlineAlert
        tone="warn"
        title="Storage almost full"
        action={<Button size="compact" variant="secondary">Upgrade</Button>}
        onDismiss={() => {}}
      >
        You've used 92% of your plan's storage.
      </InlineAlert>
    </div>
  )
}
