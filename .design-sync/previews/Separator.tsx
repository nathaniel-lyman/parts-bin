import { Separator } from 'parts-bin'

export function Horizontal() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280, fontSize: 13 }}>
      <span>Account overview</span>
      <Separator />
      <span>Billing history</span>
    </div>
  )
}

export function Vertical() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', height: 24, fontSize: 13 }}>
      <span>Active</span>
      <Separator orientation="vertical" />
      <span>At risk</span>
      <Separator orientation="vertical" />
      <span>Churned</span>
    </div>
  )
}
