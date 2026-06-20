---
category: Forms
---

Themed text input; passes through all native input attributes.

**When to use:** Single-line free-text or typed input (text, email, number, …).

**Key props:** `value`, `onChange`, `placeholder`, `type`, `disabled`

**Example:**
```tsx
<Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Name" />
```
