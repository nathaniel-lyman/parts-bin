import { describe, expect, it } from 'vitest'
import { buildAccountGridTestHarness, makeRows } from './harness'

describe('buildAccountGridTestHarness', () => {
  it('generates deterministic row ids', () => {
    expect(makeRows(3).map((row) => row.id)).toEqual(['row-0', 'row-1', 'row-2'])
  })

  it('builds a table keyed by getRowId', () => {
    const { table } = buildAccountGridTestHarness({ rowCount: 5 })
    expect(table.getRowModel().rows.map((row) => row.id)).toEqual(['row-0', 'row-1', 'row-2', 'row-3', 'row-4'])
  })

  it('applies row pinning', () => {
    const { table } = buildAccountGridTestHarness({
      rowCount: 10,
      rowPinning: { top: ['row-0'], bottom: ['row-9'] },
    })
    expect(table.getTopRows().map((row) => row.id)).toEqual(['row-0'])
    expect(table.getBottomRows().map((row) => row.id)).toEqual(['row-9'])
    expect(table.getCenterRows().map((row) => row.id)).not.toContain('row-0')
  })

  it('applies column pinning and visibility', () => {
    const { table } = buildAccountGridTestHarness({
      rowCount: 3,
      columnPinning: { left: ['account'], right: ['actions'] },
      columnVisibility: { arr: true, since: false },
    })
    expect(table.getLeftVisibleLeafColumns().map((column) => column.id)).toContain('account')
    expect(table.getRightVisibleLeafColumns().map((column) => column.id)).toContain('actions')
    expect(table.getVisibleLeafColumns().map((column) => column.id)).not.toContain('since')
  })
})
