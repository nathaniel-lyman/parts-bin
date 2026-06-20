---
category: Chat
---

Copy / regenerate / feedback action row for a completed assistant message.

**When to use:** The actions slot of ChatMessageBubble.

**Key props:** `content`, `onRegenerate`, `onFeedback`

**Example:**
```tsx
<MessageActions content={m.content} onRegenerate={regenerate} onFeedback={(k) => track(k)} />
```
