---
category: Data Display
---

Single-column label/value list for record fields.

**When to use:** A short vertical list of label/value pairs.

**Key props:** `items`, `className`

**vs DescriptionList:** Use DescriptionList for a multi-column (1–3) grid layout.

**vs PropertyGrid:** Use PropertyGrid for a denser 3-column property grid.

**vs MetadataPanel:** Use MetadataPanel when the pairs belong in a titled card with a footer.

**Example:**
```tsx
<KeyValueList items={[{ label: 'Owner', value: 'Avery' }]} />
```
