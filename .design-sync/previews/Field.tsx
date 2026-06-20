import { Field, Input } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 360 }}>
      <Field label="Workspace name" required>
        <Input placeholder="Cobalt Freight" defaultValue="Cobalt Freight" readOnly />
      </Field>
    </div>
  )
}

export function WithHint() {
  return (
    <div style={{ width: 360 }}>
      <Field label="Billing email" hint="Invoices and receipts are sent here.">
        <Input type="email" defaultValue="billing@cobalt.co" readOnly />
      </Field>
    </div>
  )
}

export function WithError() {
  return (
    <div style={{ width: 360 }}>
      <Field label="Seats" required error="Must be at least 1 seat.">
        <Input type="number" defaultValue="0" readOnly />
      </Field>
    </div>
  )
}

export function Horizontal() {
  return (
    <div style={{ width: 460 }}>
      <Field label="Account owner" layout="horizontal" hint="Receives admin notifications.">
        <Input defaultValue="Avery Cohen" readOnly />
      </Field>
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ width: 360 }}>
      <Field label="Region" disabled hint="Locked while migration is in progress.">
        <Input defaultValue="us-east-1" readOnly />
      </Field>
    </div>
  )
}
