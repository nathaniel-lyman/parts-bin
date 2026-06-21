import type { DataGridColumn, DataGridState } from '../types'
import { DEFAULT_STATE } from '../state'

export interface ProductRow {
  id: string
  title: string
  sku: string
  category: 'Hardware' | 'Software' | 'Services'
  quantity: number
  score: number
  status: 'Ready' | 'Review' | 'Blocked'
  updatedAt: string
}

export const productRows: ProductRow[] = [
  { id: 'p1', title: 'Widget', sku: 'WDG-1', category: 'Hardware', quantity: 30, score: 95, status: 'Review', updatedAt: '2026-06-01' },
  { id: 'p2', title: 'Gadget', sku: 'GDT-2', category: 'Software', quantity: 10, score: 72, status: 'Ready', updatedAt: '2026-06-02' },
  { id: 'p3', title: 'Gizmo', sku: 'GZM-3', category: 'Services', quantity: 20, score: 81, status: 'Ready', updatedAt: '2026-06-03' },
]

export const productColumns: DataGridColumn<ProductRow>[] = [
  { id: 'title', accessorKey: 'title', header: 'Title', type: 'text', editable: true, meta: { type: 'text' }, validate: (value) => (String(value).trim() === '' ? 'Title is required' : null) },
  { id: 'sku', accessorKey: 'sku', header: 'SKU', type: 'text', editable: true, meta: { type: 'text' } },
  { id: 'category', accessorKey: 'category', header: 'Category', type: 'status', editable: true, groupable: true, meta: { type: 'enum', options: ['Hardware', 'Software', 'Services'] } },
  { id: 'quantity', accessorKey: 'quantity', header: 'Quantity', type: 'number', align: 'right', editable: true, aggregate: 'sum', validate: (value) => (Number(value) < 0 ? 'Quantity cannot be negative' : null) },
  { id: 'score', accessorKey: 'score', header: 'Score', type: 'number', align: 'right', editable: true, aggregate: 'avg' },
  { id: 'status', accessorKey: 'status', header: 'Status', type: 'status', editable: true, groupable: true, meta: { options: ['Ready', 'Review', 'Blocked'] } },
  { id: 'updatedAt', accessorKey: 'updatedAt', header: 'Updated', type: 'date' },
  {
    id: 'actions',
    header: 'Actions',
    width: 76,
    minWidth: 76,
    maxWidth: 76,
    align: 'right',
    type: 'actions',
    hideable: false,
    sortable: false,
    reorderable: false,
    exportable: false,
    pinnable: true,
    cell: (ctx) => <button type="button" aria-label={`Open ${ctx.row.title}`}>Open</button>,
  },
]

export const PRODUCT_GRID_INITIAL_STATE: DataGridState = {
  ...DEFAULT_STATE,
  sorting: [{ id: 'quantity', desc: true }],
  columnVisibility: { title: true, score: false, updatedAt: false },
  columnOrder: ['title', 'sku', 'category', 'quantity', 'score', 'status', 'updatedAt', 'actions'],
  columnPinning: { left: [], right: ['actions'] },
}

export function productGlobalFilter(row: ProductRow, value: string): boolean {
  const q = value.toLowerCase()
  return row.title.toLowerCase().includes(q) || row.sku.toLowerCase().includes(q)
}
