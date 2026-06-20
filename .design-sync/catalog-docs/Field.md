---
category: Forms
---

Label + hint + error wrapper that wires accessibility to its child control.

**When to use:** Giving any single control a label, help text, and validation message.

**Key props:** `label`, `children`, `hint`, `error`, `required`

**Example:**
```tsx
<Field label="Name" required error={err}><Input value={v} onChange={onChange} /></Field>
```
