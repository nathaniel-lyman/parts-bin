import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const pkg = await import('parts-bin/datagrid')

const forbiddenExports = ['generateAccounts', 'createMockServerAdapter']
for (const name of forbiddenExports) {
  if (name in pkg) {
    throw new Error(`parts-bin/datagrid must not export demo helper ${name}`)
  }
}

for (const name of ['DataGrid', 'DEFAULT_STATE', 'createMemoryServerAdapter', 'serializeCSV', 'toGridQuery']) {
  if (!(name in pkg)) {
    throw new Error(`parts-bin/datagrid is missing ${name}`)
  }
}

const rows = [
  { id: 'sku-1', sku: 'WDG-1', title: 'Widget', quantity: 12, updatedAt: '2026-06-01' },
  { id: 'sku-2', sku: 'GDT-2', title: 'Gadget', quantity: 4, updatedAt: '2026-06-02' },
  { id: 'sku-3', sku: 'GZM-3', title: 'Gizmo', quantity: 9, updatedAt: '2026-06-03' },
]

const columns = [
  { id: 'sku', accessorKey: 'sku', header: 'SKU', type: 'text' },
  { id: 'title', accessorKey: 'title', header: 'Title', type: 'text' },
  { id: 'quantity', accessorKey: 'quantity', header: 'Quantity', type: 'number' },
  { id: 'updatedAt', accessorKey: 'updatedAt', header: 'Updated', type: 'date' },
]

const adapter = pkg.createMemoryServerAdapter(rows, { columns, latencyMs: 0, globalFilterColumns: ['sku', 'title'] })
const result = await adapter.fetch({
  version: 1,
  scope: 'page',
  sorting: [{ id: 'quantity', desc: true }],
  columnFilters: [],
  globalFilter: 'g',
  pagination: { pageIndex: 0, pageSize: 2 },
}, { signal: new AbortController().signal, requestId: 1 })

if (result.totalRowCount !== 3 || result.rows.length !== 2 || result.rows[0]?.sku !== 'WDG-1') {
  throw new Error(`generic DataGrid package adapter returned unexpected rows: ${JSON.stringify(result)}`)
}

const csv = pkg.serializeCSV(rows, columns, {
  getRowId: (row) => row.id,
  columnOrder: ['title', 'sku', 'quantity', 'updatedAt'],
  columnVisibility: {},
})
if (!csv.startsWith('Title,SKU,Quantity,Updated\nWidget,WDG-1,12,2026-06-01')) {
  throw new Error(`generic DataGrid CSV serialization returned unexpected output: ${csv}`)
}

const bundle = await readFile(resolve('dist/datagrid.js'), 'utf8')
for (const marker of ['generateAccounts', 'Cobalt Freight']) {
  if (bundle.includes(marker)) {
    throw new Error(`dist/datagrid.js contains demo/legacy marker ${marker}`)
  }
}

console.log('parts-bin/datagrid package boundary verified')
