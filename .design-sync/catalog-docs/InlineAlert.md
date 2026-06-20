---
category: Feedback
---

Persistent in-context alert banner with tone, title, and optional dismiss.

**When to use:** Surfacing a message that must stay visible in place until resolved.

**Key props:** `tone`, `title`, `children`, `action`, `onDismiss`

**vs Toast:** Use Toast for a transient, auto-dismissing notification.

**Example:**
```tsx
<InlineAlert tone="warn" title="Heads up">Renewal is overdue.</InlineAlert>
```
