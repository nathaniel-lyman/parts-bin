import { Banner, Button } from 'parts-bin'

export function Tones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 460 }}>
      <Banner tone="accent">A new analytics dashboard is now available for your workspace.</Banner>
      <Banner tone="pos">All invoices for May have been reconciled successfully.</Banner>
      <Banner tone="warn">Your trial ends in 3 days. Add a payment method to keep Pro features.</Banner>
      <Banner tone="neg">We couldn't sync 2 accounts from Salesforce. Retry the connection.</Banner>
    </div>
  )
}

export function WithActionAndDismiss() {
  return (
    <div style={{ width: 460 }}>
      <Banner
        tone="warn"
        action={<Button size="compact" variant="secondary">Upgrade plan</Button>}
        onDismiss={() => {}}
      >
        You've used 92% of your seat allocation across all teams.
      </Banner>
    </div>
  )
}
