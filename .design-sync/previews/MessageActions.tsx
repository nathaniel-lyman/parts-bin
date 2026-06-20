import { MessageActions } from 'parts-bin'

const noop = () => {}

export function FullActions() {
  return (
    <div
      style={{
        width: 360,
        padding: 16,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--ink)' }}>
        Active MRR is $207.3K across 42 visible accounts.
      </p>
      <MessageActions
        content="Active MRR is $207.3K across 42 visible accounts."
        onRegenerate={noop}
        onFeedback={noop}
      />
    </div>
  )
}

export function CopyOnly() {
  return (
    <div
      style={{
        width: 360,
        padding: 16,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--ink)' }}>
        Saved view "At-risk Enterprise" created.
      </p>
      <MessageActions content='Saved view "At-risk Enterprise" created.' />
    </div>
  )
}
