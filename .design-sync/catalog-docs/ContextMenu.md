---
category: Overlays
---

Right-click menu that opens at the pointer over a wrapped target.

**When to use:** Contextual actions on rows, cards, or canvas regions via right-click.

**Key props:** `items`, `children`, `className`

**vs DropdownMenu:** Use DropdownMenu when actions hang off a visible trigger button.

**Example:**
```tsx
<ContextMenu items={[{ id: 'del', label: 'Delete', destructive: true, onSelect: del }]}><RecordRow /></ContextMenu>
```
