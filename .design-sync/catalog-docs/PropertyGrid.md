---
category: Data Display
---

Description list preset to a dense 3-column property grid.

**When to use:** Many compact properties that read best in a wide 3-column grid.

**Key props:** `items`, `columns`, `className`

**vs KeyValueList:** Use KeyValueList for a simple single-column list.

**vs DescriptionList:** Use DescriptionList to choose 1–2 columns explicitly.

**vs MetadataPanel:** Use MetadataPanel when the pairs belong in a titled card with a footer.

**Example:**
```tsx
<PropertyGrid items={props} />
```
