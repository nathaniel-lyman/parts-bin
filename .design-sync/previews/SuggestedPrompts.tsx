import { SuggestedPrompts } from 'parts-bin'

const noop = () => {}

export function PromptChips() {
  return (
    <div
      style={{
        width: 440,
        padding: 20,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      <SuggestedPrompts
        prompts={[
          'Summarize selected rows',
          'Which accounts need review?',
          "What's our average growth?",
          'Create a saved view for this screen',
        ]}
        onSelect={noop}
      />
    </div>
  )
}
