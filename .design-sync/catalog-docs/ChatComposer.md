---
category: Chat
---

Auto-growing chat input: Enter sends, Shift+Enter newlines, send morphs to Stop while streaming.

**When to use:** The input row of any chat surface.

**Key props:** `onSend`, `streaming`, `onStop`, `placeholder`, `autoFocus`

**Example:**
```tsx
<ChatComposer onSend={send} streaming={status === 'streaming'} onStop={stop} />
```
