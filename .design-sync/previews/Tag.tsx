import { Tag } from 'parts-bin'

export function Tones() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Tag tone="accent" label="Beta" />
      <Tag tone="pos" label="Live" />
      <Tag tone="warn" label="Trial" />
      <Tag tone="neg" label="Overdue" />
      <Tag tone="neutral" label="read-only" />
    </div>
  )
}

export function Removable() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Tag tone="accent" label="Enterprise" onRemove={() => {}} />
      <Tag tone="accent" label="North America" onRemove={() => {}} />
    </div>
  )
}
