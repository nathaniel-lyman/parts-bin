import { formatDataGridNumber, isNumericColumnType } from './numberFormat'
import type { LedgerGridColumn } from './types'
import type { DataGridNumberFormat } from './types'

export interface SerializeTSVOptions<TData> {
  getRowId: (row: TData) => string
  columnOrder?: string[]
  columnVisibility?: Record<string, boolean>
  rowSelection?: Record<string, boolean>
  includeHeader?: boolean
  /** Apply each column's `exportValue` formatter (clipboard copy). File exports leave this off. */
  formatted?: boolean
  numberFormats?: Record<string, DataGridNumberFormat>
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

// Raw accessor value, or the column's formatted `exportValue` when `formatted` is set (clipboard
// copy). Keeps file exports on the raw value so XLSX still writes real numbers, not "$24,600" text.
function exportCellValue<TData>(
  row: TData,
  column: LedgerGridColumn<TData>,
  opts: Pick<SerializeTSVOptions<TData>, 'formatted' | 'numberFormats'>,
): unknown {
  const raw = resolveValue(row, column)
  if (opts.formatted && isNumericColumnType(column.type)) {
    return formatDataGridNumber(raw, column.type, column.numberFormat, opts.numberFormats?.[column.id])
  }
  return opts.formatted && column.exportValue ? column.exportValue(raw, row) : raw
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

// A selection filter only applies when at least one row is actually selected. An empty selection
// map means "nothing selected", which must export every row — not zero. Callers hand us
// `state.rowSelection` directly, and that is `{}` (truthy) when the grid has no selection, so the
// emptiness check has to live here rather than relying on callers to pass `undefined`.
function selectExportRows<TData>(rows: TData[], opts: SerializeTSVOptions<TData>): TData[] {
  const selection = opts.rowSelection
  if (!selection || Object.keys(selection).length === 0) return rows
  return rows.filter((row) => selection[opts.getRowId(row)])
}

export function serializeTSV<TData>(
  rows: TData[],
  columns: LedgerGridColumn<TData>[],
  opts: SerializeTSVOptions<TData>,
): string {
  const cols = orderedExportColumns(columns, opts.columnOrder, opts.columnVisibility)
  const dataRows = selectExportRows(rows, opts)

  const lines: string[] = []
  if (opts.includeHeader !== false) {
    lines.push(cols.map((column) => cleanCell(typeof column.header === 'string' ? column.header : column.id)).join('\t'))
  }
  for (const row of dataRows) {
    lines.push(cols.map((column) => cleanCell(exportCellValue(row, column, opts))).join('\t'))
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
  const dataRows = selectExportRows(rows, opts)

  const lines: string[] = []
  if (opts.includeHeader !== false) {
    lines.push(cols.map((column) => escapeCsvCell(typeof column.header === 'string' ? column.header : column.id)).join(','))
  }
  for (const row of dataRows) {
    lines.push(cols.map((column) => escapeCsvCell(exportCellValue(row, column, opts))).join(','))
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

function escapeXml(value: unknown): string {
  return cleanCell(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnName(index: number): string {
  let name = ''
  let current = index + 1
  while (current > 0) {
    const remainder = (current - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    current = Math.floor((current - 1) / 26)
  }
  return name
}

function worksheetCell(value: unknown, rowIndex: number, colIndex: number): string {
  const ref = `${columnName(colIndex)}${rowIndex + 1}`
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`
  return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`
}

function worksheetXml<TData>(
  rows: TData[],
  columns: LedgerGridColumn<TData>[],
  opts: SerializeTSVOptions<TData>,
): string {
  const cols = orderedExportColumns(columns, opts.columnOrder, opts.columnVisibility)
  const dataRows = selectExportRows(rows, opts)
  const sheetRows: string[] = []
  if (opts.includeHeader !== false) {
    sheetRows.push(`<row r="1">${cols.map((column, index) => worksheetCell(typeof column.header === 'string' ? column.header : column.id, 0, index)).join('')}</row>`)
  }
  const offset = opts.includeHeader === false ? 0 : 1
  dataRows.forEach((row, rowIndex) => {
    sheetRows.push(`<row r="${rowIndex + offset + 1}">${cols.map((column, colIndex) => worksheetCell(exportCellValue(row, column, opts), rowIndex + offset, colIndex)).join('')}</row>`)
  })
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows.join('')}</sheetData></worksheet>`
}

const CRC_TABLE = new Uint32Array(256)
for (let index = 0; index < 256; index += 1) {
  let c = index
  for (let bit = 0; bit < 8; bit += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  CRC_TABLE[index] = c >>> 0
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function writeU16(out: number[], value: number): void {
  out.push(value & 0xff, (value >>> 8) & 0xff)
}

function writeU32(out: number[], value: number): void {
  out.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff)
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(length)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function zipStore(files: Array<{ path: string; content: string }>): Uint8Array {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.path)
    const content = encoder.encode(file.content)
    const crc = crc32(content)
    const local: number[] = []
    writeU32(local, 0x04034b50)
    writeU16(local, 20)
    writeU16(local, 0)
    writeU16(local, 0)
    writeU16(local, 0)
    writeU16(local, 0)
    writeU32(local, crc)
    writeU32(local, content.length)
    writeU32(local, content.length)
    writeU16(local, name.length)
    writeU16(local, 0)
    const localBytes = concatBytes([new Uint8Array(local), name, content])
    parts.push(localBytes)

    const dir: number[] = []
    writeU32(dir, 0x02014b50)
    writeU16(dir, 20)
    writeU16(dir, 20)
    writeU16(dir, 0)
    writeU16(dir, 0)
    writeU16(dir, 0)
    writeU16(dir, 0)
    writeU32(dir, crc)
    writeU32(dir, content.length)
    writeU32(dir, content.length)
    writeU16(dir, name.length)
    writeU16(dir, 0)
    writeU16(dir, 0)
    writeU16(dir, 0)
    writeU16(dir, 0)
    writeU32(dir, 0)
    writeU32(dir, offset)
    central.push(concatBytes([new Uint8Array(dir), name]))
    offset += localBytes.length
  }

  const centralStart = offset
  const centralBytes = concatBytes(central)
  const end: number[] = []
  writeU32(end, 0x06054b50)
  writeU16(end, 0)
  writeU16(end, 0)
  writeU16(end, files.length)
  writeU16(end, files.length)
  writeU32(end, centralBytes.length)
  writeU32(end, centralStart)
  writeU16(end, 0)
  return concatBytes([...parts, centralBytes, new Uint8Array(end)])
}

export function serializeXLSX<TData>(
  rows: TData[],
  columns: LedgerGridColumn<TData>[],
  opts: SerializeTSVOptions<TData>,
): Uint8Array {
  return zipStore([
    {
      path: '[Content_Types].xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    },
    {
      path: '_rels/.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    },
    {
      path: 'xl/workbook.xml',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>',
    },
    {
      path: 'xl/_rels/workbook.xml.rels',
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    },
    {
      path: 'xl/worksheets/sheet1.xml',
      content: worksheetXml(rows, columns, opts),
    },
  ])
}

export function downloadXLSX(filename: string, bytes: Uint8Array): void {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
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
