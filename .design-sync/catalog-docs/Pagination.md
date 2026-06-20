---
category: Data Display
---

Page navigation control derived from page/pageSize/total.

**When to use:** Paging through a list or table not handled by DataGrid itself.

**Key props:** `page`, `pageSize`, `total`, `onPageChange`

**Example:**
```tsx
<Pagination page={p} pageSize={25} total={240} onPageChange={setP} />
```
