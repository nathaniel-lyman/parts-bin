import { Avatar } from 'parts-bin'

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 360 }}>
      <Avatar name="Avery Chen" size="sm" />
      <Avatar name="Marcus Webb" size="md" />
      <Avatar name="Priya Nair" size="lg" />
    </div>
  )
}

export function Presence() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 360 }}>
      <Avatar name="Avery Chen" status="online" />
      <Avatar name="Marcus Webb" status="away" />
      <Avatar name="Priya Nair" status="busy" />
      <Avatar name="Diego Santos" status="offline" />
    </div>
  )
}

export function CustomInitials() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 360 }}>
      <Avatar name="Northwind Traders" initials="NT" size="lg" />
      <Avatar name="Globex Corporation" initials="GX" size="lg" status="online" />
    </div>
  )
}
