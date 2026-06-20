import { Button } from 'parts-bin'

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Dismiss</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary" size="default">Default</Button>
      <Button variant="primary" size="compact">Compact</Button>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary" loading>Saving…</Button>
      <Button variant="secondary" disabled>Disabled</Button>
    </div>
  )
}
