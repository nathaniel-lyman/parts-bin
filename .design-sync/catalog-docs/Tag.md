---
category: Primitives
---

General-purpose label chip with tone variants and optional remove button.

**When to use:** Tagging records with categories, topics, or token values.

**Key props:** `label`, `tone`, `onRemove`, `className`

**vs StatusBadge:** Use StatusBadge for lifecycle status (Open / Review / Blocked), not free-form labels.

**Example:**
```tsx
<Tag tone="accent" label="Beta" onRemove={() => drop('beta')} />
```
