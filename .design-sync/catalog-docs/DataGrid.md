---
category: Data Grid
---

Headless-table-backed data grid: sort, filter, select, paginate, export, saved views, inline editing, grouping, aggregation.

**When to use:** Displaying tabular records with interaction; the rows prop takes the data. Mark columns editable/groupable/aggregate to light up editing, grouping chips, and the totals footer.

**Key props:** `rows`, `columns`, `getRowId`, `enableRowSelection`, `enablePagination`, `enableExport`, `exportFilename`, `persistenceKey`, `onContextChange`, `quickFilterPlaceholder`, `enableGrouping`, `onRowUpdate`, `editMode`

**Example:**
```tsx
<DataGrid rows={records} columns={cols} getRowId={(r) => r.id} enableRowSelection enableGrouping onRowUpdate={(id, patch) => update(id, patch)} />
```
