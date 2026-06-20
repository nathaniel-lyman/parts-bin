---
category: Forms
---

Native single-select dropdown styled to the theme.

**When to use:** Short, fixed list of options where type-ahead adds no value.

**Key props:** `value`, `onChange`, `children`, `disabled`

**vs Combobox:** Use Combobox when options exceed ~7 or filtering helps.

**vs DropdownMenu:** Use DropdownMenu for actions, not value selection.

**Example:**
```tsx
<Select value={v} onChange={(e) => setV(e.target.value)}><option>SMB</option></Select>
```
