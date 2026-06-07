import type { LedgerGridColumn } from './types'

export interface SerializeTSVOptions<TData> {
  getRowId: (row: TData) => string
  columnOrder?: string[]
  columnVisibility?: Record<string, boolean>
  rowSelection?: Record<string, boolean>
  includeHeader?: boolean
}

function cleanCell(value: unknown): string {
  if (value == null) return ''
  return String(value).replace(/[\t\n\r]+/g, ' ')
}

function resolveValue<TData>(row: TData, column: LedgerGridColumn<TData>): unknown {
  if (column.accessorFn) return column.accessorFn(row)
  if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey as string]
  return ''
}

function orderedExportColumns<TData>(
  columns: LedgerGridColumn<TData>[],
  columnOrder?: string[],
  columnVisibility?: Record<string, boolean>,
): LedgerGridColumn<TData>[] {
  const byId = new Map(columns.map((column) => [column.id, column]))
  const ids = columnOrder ?? columns.map((column) => column.id)
  const out: LedgerGridColumn<TData>[] = []

  for (const id of ids) {
    const column = byId.get(id)
    if (!column) continue
    if (column.exportable === false || column.type === 'actions') continue
    if (columnVisibility?.[id] === false) continue
    out.push(column)
  }

  return out
}

export function serializeTSV<TData>(
  rows: TData[],
  columns: LedgerGridColumn<TData>[],
  opts: SerializeTSVOptions<TData>,
): string {
  const cols = orderedExportColumns(columns, opts.columnOrder, opts.columnVisibility)
  const dataRows = opts.rowSelection
    ? rows.filter((row) => opts.rowSelection?.[opts.getRowId(row)])
    : rows

  const lines: string[] = []
  if (opts.includeHeader !== false) {
    lines.push(cols.map((column) => cleanCell(typeof column.header === 'string' ? column.header : column.id)).join('\t'))
  }
  for (const row of dataRows) {
    lines.push(cols.map((column) => cleanCell(resolveValue(row, column))).join('\t'))
  }
  return lines.join('\n')
}

export function serializeCell(value: unknown): string {
  return cleanCell(value)
}

function escapeCsvCell(value: unknown): string {
  const text = cleanCell(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function serializeCSV<TData>(
  rows: TData[],
  columns: LedgerGridColumn<TData>[],
  opts: SerializeTSVOptions<TData>,
): string {
  const cols = orderedExportColumns(columns, opts.columnOrder, opts.columnVisibility)
  const dataRows = opts.rowSelection
    ? rows.filter((row) => opts.rowSelection?.[opts.getRowId(row)])
    : rows

  const lines: string[] = []
  if (opts.includeHeader !== false) {
    lines.push(cols.map((column) => escapeCsvCell(typeof column.header === 'string' ? column.header : column.id)).join(','))
  }
  for (const row of dataRows) {
    lines.push(cols.map((column) => escapeCsvCell(resolveValue(row, column))).join(','))
  }
  return lines.join('\n')
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
  }
}
