import { ChatComposer } from 'parts-bin'

const noop = () => {}

export function Idle() {
  return (
    <div
      style={{
        width: 440,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      <ChatComposer
        onSend={noop}
        onStop={noop}
        streaming={false}
        placeholder="Ask about accounts, MRR, or this screen…"
      />
    </div>
  )
}

export function Streaming() {
  return (
    <div
      style={{
        width: 440,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      <ChatComposer
        onSend={noop}
        onStop={noop}
        streaming
        placeholder="Generating a response…"
      />
    </div>
  )
}
