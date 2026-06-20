import { AvatarGroup } from 'parts-bin'

const team = [
  { name: 'Avery Chen', status: 'online' as const },
  { name: 'Marcus Webb', status: 'away' as const },
  { name: 'Priya Nair' },
  { name: 'Diego Santos' },
  { name: 'Lena Brooks' },
  { name: 'Tomas Vidal' },
]

export function Stacked() {
  return (
    <div style={{ width: 360 }}>
      <AvatarGroup users={team.slice(0, 4)} />
    </div>
  )
}

export function WithOverflow() {
  return (
    <div style={{ width: 360 }}>
      <AvatarGroup users={team} max={4} size="md" />
    </div>
  )
}

export function Large() {
  return (
    <div style={{ width: 360 }}>
      <AvatarGroup users={team} max={3} size="lg" />
    </div>
  )
}
