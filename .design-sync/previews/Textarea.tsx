import { Textarea } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 360 }}>
      <Textarea placeholder="Add a note about this account…" rows={3} readOnly />
    </div>
  )
}

export function WithValue() {
  return (
    <div style={{ width: 360 }}>
      <Textarea
        defaultValue="Renewal call scheduled for Aug 12. Expansion likely — 12 new seats requested."
        rows={3}
        readOnly
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ width: 360 }}>
      <Textarea defaultValue="Locked while the import is running." rows={3} disabled />
    </div>
  )
}
