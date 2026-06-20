---
category: Chat
---

One chat turn: user bubble, or assistant markdown with streaming cursor and error state.

**When to use:** Rendering ChatMessageData from useChat; pass MessageActions via the actions slot.

**Key props:** `message`, `actions`

**Example:**
```tsx
<ChatMessageBubble message={m} actions={<MessageActions content={m.content} />} />
```
