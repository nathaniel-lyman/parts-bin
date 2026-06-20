---
category: Data Display
---

Lightweight static table (columns + rows) for small read-only datasets.

**When to use:** A detail panel or card needs a handful of rows with no interaction.

**Key props:** `columns`, `rows`, `rowKey`, `caption`, `emptyMessage`, `className`

**vs DataGrid:** Use DataGrid when the data needs sorting, filtering, selection, or column management.

**Example:**
```tsx
<Table caption="Open projects" columns={[{ key: 'name', header: 'Project' }, { key: 'score', header: 'Score', numeric: true }]} rows={rows} rowKey={(r) => r.id} />
```
