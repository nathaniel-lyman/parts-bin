---
category: Chat
---

Chat scroll container that follows streaming output and releases when the reader scrolls up.

**When to use:** Any custom chat layout; wrap ChatMessageBubble children.

**Key props:** `children`, `className`

**Example:**
```tsx
<ChatMessageList>{messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)}</ChatMessageList>
```
