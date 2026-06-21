export interface CellCoord {
  row: number
  col: number
}

export interface CellRange {
  anchor: CellCoord
  focus: CellCoord
}

export interface CellRangeBounds {
  rowStart: number
  rowEnd: number
  colStart: number
  colEnd: number
}

export function cellRangeBounds(range: CellRange): CellRangeBounds {
  return {
    rowStart: Math.min(range.anchor.row, range.focus.row),
    rowEnd: Math.max(range.anchor.row, range.focus.row),
    colStart: Math.min(range.anchor.col, range.focus.col),
    colEnd: Math.max(range.anchor.col, range.focus.col),
  }
}

export function isCellInRange(range: CellRange | null, row: number | undefined, col: number | undefined): boolean {
  if (!range || row === undefined || col === undefined) return false
  const bounds = cellRangeBounds(range)
  return row >= bounds.rowStart && row <= bounds.rowEnd && col >= bounds.colStart && col <= bounds.colEnd
}

export function isMultiCellRange(range: CellRange | null): boolean {
  if (!range) return false
  return range.anchor.row !== range.focus.row || range.anchor.col !== range.focus.col
}

export function serializeCellRange<TData>(
  range: CellRange,
  rows: TData[],
  columnIds: string[],
  resolveCellValue: (row: TData, columnId: string) => unknown,
): string {
  const bounds = cellRangeBounds(range)
  const lines: string[] = []
  for (let rowIndex = bounds.rowStart; rowIndex <= bounds.rowEnd; rowIndex += 1) {
    const row = rows[rowIndex]
    if (!row) continue
    const values: string[] = []
    for (let colIndex = bounds.colStart; colIndex <= bounds.colEnd; colIndex += 1) {
      const columnId = columnIds[colIndex]
      if (!columnId) continue
      values.push(String(resolveCellValue(row, columnId) ?? '').replace(/[\t\n\r]+/g, ' '))
    }
    lines.push(values.join('\t'))
  }
  return lines.join('\n')
}

export function parseClipboardTable(text: string): string[][] {
  const trimmed = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rows = trimmed.endsWith('\n') ? trimmed.slice(0, -1).split('\n') : trimmed.split('\n')
  return rows.map((row) => row.split('\t'))
}
