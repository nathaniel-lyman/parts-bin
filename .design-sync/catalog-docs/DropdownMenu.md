---
category: Overlays
---

Button-triggered menu of actions, with destructive and disabled items.

**When to use:** Offering a list of actions (not selecting a value).

**Key props:** `label`, `items`, `align`

**vs Select:** Use Select to choose a form value, not to run actions.

**vs Combobox:** Use Combobox to pick a value with type-ahead, not to run actions.

**Example:**
```tsx
<DropdownMenu label="Actions" items={[{ id: 'del', label: 'Delete', destructive: true, onSelect: del }]} />
```
