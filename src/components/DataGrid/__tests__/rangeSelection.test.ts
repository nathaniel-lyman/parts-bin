import { describe, expect, it } from 'vitest'
import { cellRangeBounds, isCellInRange, isMultiCellRange, parseClipboardTable, serializeCellRange } from '../rangeSelection'

describe('rangeSelection helpers', () => {
  it('normalizes bounds and detects cells inside the rectangle', () => {
    const range = { anchor: { row: 3, col: 4 }, focus: { row: 1, col: 2 } }

    expect(cellRangeBounds(range)).toEqual({ rowStart: 1, rowEnd: 3, colStart: 2, colEnd: 4 })
    expect(isCellInRange(range, 2, 3)).toBe(true)
    expect(isCellInRange(range, 0, 3)).toBe(false)
    expect(isMultiCellRange(range)).toBe(true)
  })

  it('serializes a rectangular cell range as TSV', () => {
    const rows = [
      { account: 'Acme', owner: 'Dana' },
      { account: 'Beta', owner: 'Lee' },
    ]

    expect(serializeCellRange(
      { anchor: { row: 0, col: 0 }, focus: { row: 1, col: 1 } },
      rows,
      ['account', 'owner'],
      (row, columnId) => row[columnId as 'account' | 'owner'],
    )).toBe('Acme\tDana\nBeta\tLee')
  })

  it('parses pasted spreadsheet text into a cell matrix', () => {
    expect(parseClipboardTable('A\tB\r\nC\tD\n')).toEqual([
      ['A', 'B'],
      ['C', 'D'],
    ])
  })
})
