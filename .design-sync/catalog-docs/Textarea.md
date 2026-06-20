---
category: Forms
---

Themed multi-line text input; passes through native textarea attributes.

**When to use:** Free-text that may span multiple lines (notes, descriptions).

**Key props:** `value`, `onChange`, `placeholder`, `rows`, `disabled`

**Example:**
```tsx
<Textarea value={v} onChange={(e) => setV(e.target.value)} rows={4} />
```
