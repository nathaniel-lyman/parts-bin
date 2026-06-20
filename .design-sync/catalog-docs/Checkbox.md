---
category: Forms
---

Single boolean checkbox with optional label and hint.

**When to use:** Toggling a single on/off choice, or one item in a multi-select set.

**Key props:** `label`, `hint`, `checked`, `onChange`, `disabled`

**Example:**
```tsx
<Checkbox label="Email me" checked={on} onChange={(e) => setOn(e.target.checked)} />
```
