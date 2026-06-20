---
category: Feedback
---

Context provider that renders queued toasts; exposes push via useToast.

**When to use:** Wrap the app once so any component can fire toasts through useToast.

**Key props:** `children`

**Example:**
```tsx
<ToastProvider><App /></ToastProvider>
```
