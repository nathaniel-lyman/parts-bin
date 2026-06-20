---
category: Feedback
---

Single transient notification with optional title, action button, and dismiss.

**When to use:** Rarely directly — prefer the useToast hook via ToastProvider: push(text, { tone, title, action, duration }).

**Key props:** `tone`, `title`, `action`, `onDismiss`, `children`

**vs InlineAlert:** Use InlineAlert for a persistent in-context message.

**Example:**
```tsx
toast('Record deleted', { tone: 'neg', title: 'Deleted', action: { label: 'Undo', onClick: undo } })
```
