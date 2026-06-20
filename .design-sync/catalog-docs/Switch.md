---
category: Forms
---

Toggle switch for a single boolean setting, with label and hint.

**When to use:** An immediately-applied on/off setting (vs. a form checkbox).

**Key props:** `label`, `hint`, `checked`, `onChange`, `disabled`

**Example:**
```tsx
<Switch label="Dark mode" checked={dark} onChange={(e) => setDark(e.target.checked)} />
```
