---
category: Data Display
---

Tabbed panels switching between content sections.

**When to use:** Splitting content into selectable, equally-ranked views.

**Key props:** `items`, `value`, `defaultValue`, `onValueChange`, `label`

**Example:**
```tsx
<Tabs items={[{ id: 'a', label: 'Overview', content: body }]} defaultValue="a" />
```
