import { describe, expect, it } from 'vitest'
import { aggregate, computeAggregates, formatAggregate } from '../aggregation'
import type { DataGridColumn } from '../types'

interface Row {
  id: string
  mrr: number
  growth: number
  impact?: number
  name: string
}

const rows: Row[] = [
  { id: 'a', mrr: 100, growth: 10, impact: 5, name: 'A' },
  { id: 'b', mrr: 300, growth: -4, impact: 2, name: 'B' },
  { id: 'c', mrr: 200, growth: 6, impact: 8, name: 'C' },
]

describe('aggregate', () => {
  it('computes sum/avg/min/max/count', () => {
    const values = [100, 300, 200]
    expect(aggregate('sum', values)).toBe(600)
    expect(aggregate('avg', values)).toBe(200)
    expect(aggregate('min', values)).toBe(100)
    expect(aggregate('max', values)).toBe(300)
    expect(aggregate('count', values)).toBe(3)
  })

  it('skips non-numeric values instead of coercing to 0', () => {
    expect(aggregate('sum', [100, 'oops', null, undefined, '', 50])).toBe(150)
    expect(aggregate('avg', [100, 'oops', 50])).toBe(75)
  })

  it('returns null (not 0) when no numeric values exist', () => {
    expect(aggregate('sum', ['a', null])).toBeNull()
    expect(aggregate('count', [])).toBe(0)
  })
})

describe('formatAggregate', () => {
  it('formats per column type', () => {
    expect(formatAggregate(128400, 'currency')).toBe('$128,400')
    expect(formatAggregate(4.25, 'percent')).toBe('4.3%')
    expect(formatAggregate(12, 'number')).toBe('12')
    expect(formatAggregate(12.34, 'number')).toBe('12.3')
    expect(formatAggregate(null, 'currency')).toBe('—')
  })
})

describe('computeAggregates', () => {
  const columns: DataGridColumn<Row>[] = [
    { id: 'name', accessorKey: 'name', header: 'Name', type: 'text' },
    { id: 'mrr', accessorKey: 'mrr', header: 'MRR', type: 'currency', aggregate: 'sum' },
    { id: 'growth', accessorKey: 'growth', header: 'Growth', type: 'percent', aggregate: 'avg' },
    {
      id: 'impact',
      accessorKey: 'impact',
      header: 'Impact',
      type: 'number',
      aggregate: ({ rows }) => rows.length
        ? rows.reduce((best, row) => Math.max(best, row.impact ?? Number.NEGATIVE_INFINITY), Number.NEGATIVE_INFINITY)
        : null,
    },
  ]

  it('aggregates only columns that declare an aggregate', () => {
    const result = computeAggregates(columns, rows)
    expect(Object.keys(result).sort()).toEqual(['growth', 'impact', 'mrr'])
    expect(result.mrr).toMatchObject({ kind: 'sum', label: 'Σ', value: 600, formatted: '$600' })
    // Numeric footers honour the column number format, matching the cells above: a percent column
    // renders one decimal, so the avg of 10/-4/6 (= 4) shows as '4.0%', not '4%'.
    expect(result.growth).toMatchObject({ kind: 'avg', label: 'avg', value: 4, formatted: '4.0%' })
    expect(result.impact).toMatchObject({ kind: 'custom', label: 'fx', value: 8, formatted: '8' })
  })

  it('handles an empty row set', () => {
    const result = computeAggregates(columns, [])
    expect(result.mrr.value).toBeNull()
    expect(result.mrr.formatted).toBe('—')
  })

  it('computes a count-weighted average over every row, not an average of subset averages', () => {
    // Two lopsided "groups": {10,10,10,10} and {90}. The true mean is 130/5 = 26; an avg-of-group-
    // averages would wrongly give (10 + 90) / 2 = 50. computeAggregates must take all rows at once.
    const avgRows: Row[] = [10, 10, 10, 10, 90].map((mrr, index) => ({ id: String(index), mrr, growth: 0, name: 'x' }))
    const avgColumns: DataGridColumn<Row>[] = [{ id: 'mrr', accessorKey: 'mrr', header: 'MRR', type: 'currency', aggregate: 'avg' }]
    expect(computeAggregates(avgColumns, avgRows).mrr.value).toBe(26)
  })
})
