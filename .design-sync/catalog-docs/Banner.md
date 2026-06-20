---
category: Feedback
---

Full-width app/page-level announcement bar with tone, action slot, and dismiss.

**When to use:** Maintenance windows, trial expiry, or environment notices spanning the page top.

**Key props:** `tone`, `children`, `action`, `onDismiss`, `className`

**vs InlineAlert:** Use InlineAlert for a message scoped to a section or form.

**vs Toast:** Use Toast for transient feedback that should auto-dismiss.

**Example:**
```tsx
<Banner tone="warn" action={<Button size="compact">Upgrade</Button>} onDismiss={hide}>Trial ends in 3 days.</Banner>
```
