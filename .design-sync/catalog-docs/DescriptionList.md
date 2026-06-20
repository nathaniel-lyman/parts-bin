---
category: Data Display
---

Multi-column (1–3) grid of label/value pairs.

**When to use:** Several fields you want laid out in columns rather than a single column.

**Key props:** `items`, `columns`, `className`

**vs KeyValueList:** Use KeyValueList for a simple single-column list.

**vs PropertyGrid:** PropertyGrid is this list preset to a denser 3-column default.

**vs MetadataPanel:** Use MetadataPanel when the pairs belong in a titled card with a footer.

**Example:**
```tsx
<DescriptionList items={fields} columns={2} />
```
