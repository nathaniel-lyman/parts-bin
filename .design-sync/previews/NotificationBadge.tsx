import { NotificationBadge, IconButton } from 'parts-bin'

// NotificationBadge is absolutely positioned (-top-1 -right-1), so it must sit
// inside a position:relative anchor to be visible. It caps display at "9+".
function BellWithBadge({ count }: { count: number }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <IconButton aria-label={`Notifications (${count})`}>{'☆'}</IconButton>
      <NotificationBadge count={count} />
    </span>
  )
}

export function Counts() {
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'center', padding: 24 }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
        <BellWithBadge count={3} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>count 3</span>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
        <BellWithBadge count={12} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>count 12 → 9+</span>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
        <BellWithBadge count={99} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>count 99 → 9+</span>
      </div>
    </div>
  )
}

export function OnButton() {
  return (
    <div style={{ padding: 24, position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          fontSize: 13,
          borderRadius: 4,
          border: '1px solid var(--line)',
          background: 'var(--surface)',
          color: 'var(--ink)',
        }}
      >
        Inbox
        <NotificationBadge count={5} />
      </button>
    </div>
  )
}
