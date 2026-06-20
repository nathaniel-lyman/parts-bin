import { IconButton } from 'parts-bin'

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton variant="primary" aria-label="Add account">+</IconButton>
      <IconButton variant="secondary" aria-label="Edit account">✎</IconButton>
      <IconButton variant="ghost" aria-label="More options">⋯</IconButton>
      <IconButton variant="destructive" aria-label="Delete account">×</IconButton>
    </div>
  )
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton variant="secondary" size="default" aria-label="Refresh">↻</IconButton>
      <IconButton variant="secondary" size="compact" aria-label="Refresh">↻</IconButton>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton variant="primary" loading aria-label="Saving">↻</IconButton>
      <IconButton variant="secondary" disabled aria-label="Disabled">✎</IconButton>
    </div>
  )
}
