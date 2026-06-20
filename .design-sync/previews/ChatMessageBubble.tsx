import { ChatMessageBubble, MessageActions } from 'parts-bin'

export function UserAndAssistant() {
  return (
    <div style={{ width: 440, display: 'grid', gap: 16 }}>
      <ChatMessageBubble
        message={{
          id: 'u1',
          role: 'user',
          status: 'done',
          content: 'Which accounts are at risk this quarter?',
        }}
      />
      <ChatMessageBubble
        message={{
          id: 'a1',
          role: 'assistant',
          status: 'done',
          content:
            'Three accounts need attention this quarter:\n\n- **Initech** — At risk, $4,200 MRR, usage down 38%\n- **Globex Corp** — At risk, $7,800 MRR, renewal in 21 days\n- **Hooli** — Churned, $0 MRR last month\n\nWant me to draft outreach notes for the active two?',
        }}
        actions={
          <MessageActions
            content="Three accounts need attention this quarter."
            onRegenerate={() => {}}
            onFeedback={() => {}}
          />
        }
      />
    </div>
  )
}

export function StreamingAndError() {
  return (
    <div style={{ width: 440, display: 'grid', gap: 16 }}>
      <ChatMessageBubble
        message={{
          id: 'a2',
          role: 'assistant',
          status: 'streaming',
          content: 'Net revenue movement was **net positive** last month at +$18.4K',
        }}
      />
      <ChatMessageBubble
        message={{ id: 'a3', role: 'assistant', status: 'error', content: '' }}
      />
    </div>
  )
}
