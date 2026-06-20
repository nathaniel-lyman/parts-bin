---
category: Data Display
---

Searchable multi-select facet with option counts.

**When to use:** Filtering a dataset by one faceted dimension with many options.

**Key props:** `label`, `options`, `selectedValues`, `onSelectedValuesChange`, `searchPlaceholder`

**Example:**
```tsx
<FacetedFilter label="Segment" options={opts} selectedValues={sel} onSelectedValuesChange={setSel} />
```
