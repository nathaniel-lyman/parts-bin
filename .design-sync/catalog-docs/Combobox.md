---
category: Forms
---

Single-select input with type-ahead filtering over an options list.

**When to use:** Options exceed ~7, or filtering helps the user find a value.

**Key props:** `options`, `value`, `onValueChange`, `placeholder`, `disabled`

**vs Select:** Use Select for short, fixed option lists.

**vs DropdownMenu:** Use DropdownMenu for actions, not value selection.

**Example:**
```tsx
<Combobox options={opts} value={v} onValueChange={setV} placeholder="Owner" />
```
