import { Input } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 320 }}>
      <Input placeholder="Acme Corporation" readOnly />
    </div>
  )
}

export function WithValue() {
  return (
    <div style={{ width: 320 }}>
      <Input defaultValue="avery.cohen@acme.com" readOnly />
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 320 }}>
      <Input placeholder="Search accounts…" readOnly />
      <Input defaultValue="Cobalt Freight" disabled />
    </div>
  )
}
