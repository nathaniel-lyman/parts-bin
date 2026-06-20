import { ChatMessageList, ChatMessageBubble } from 'parts-bin'

export function Conversation() {
  return (
    <div
      style={{
        width: 460,
        height: 380,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      <ChatMessageList>
        <ChatMessageBubble
          message={{
            id: 'u1',
            role: 'user',
            status: 'done',
            content: 'How did MRR move last month?',
          }}
        />
        <ChatMessageBubble
          message={{
            id: 'a1',
            role: 'assistant',
            status: 'done',
            content:
              'MRR moved **net positive** last month: +$18.4K.\n\n- New: +$22.1K\n- Expansion: +$9.7K\n- Decrease: −$13.4K',
          }}
        />
        <ChatMessageBubble
          message={{
            id: 'u2',
            role: 'user',
            status: 'done',
            content: 'Which segment drove expansion?',
          }}
        />
        <ChatMessageBubble
          message={{
            id: 'a2',
            role: 'assistant',
            status: 'done',
            content:
              'The **Enterprise** segment drove 71% of expansion, led by Northwind Traders upgrading from 38 to 60 seats.',
          }}
        />
      </ChatMessageList>
    </div>
  )
}
