import { AssistantPanel, createDemoAdapter } from 'parts-bin'

// Zero-setup demo adapter over an empty dataset — nothing is sent in a static
// preview, so the panel renders its empty state: header + prompt suggestions +
// composer. (The Drawer it lives in is a fixed full-viewport overlay with a
// 420px panel pinned to the right edge.)
const adapter = createDemoAdapter(() => [])

const noop = () => {}

export function EmptyStateWithSuggestions() {
  return (
    <div style={{ position: 'relative', width: 760, height: 520 }}>
      <AssistantPanel
        adapter={adapter}
        onClose={noop}
        title="Assistant"
        suggestions={[
          'Summarize selected rows',
          'Which accounts need review?',
          "What's our average growth?",
          'How do I integrate a real model?',
        ]}
      />
    </div>
  )
}
