---
category: Chat
---

Slide-over AI chat: empty state, streaming messages, composer — wired to any ChatAdapter.

**When to use:** An embedded AI assistant surface. Pass an adapter that streams from your product API.

**Key props:** `adapter`, `onClose`, `title`, `suggestions`, `chat`

**vs Drawer:** Use Drawer for generic side panels; AssistantPanel for conversational AI surfaces.

**Example:**
```tsx
{open && <AssistantPanel adapter={adapter} suggestions={suggestions} onClose={close} />}
```
