import { describe, expect, it } from 'vitest'
import { aggregate, computeAggregates, formatAggregate } from '../aggregation'
import type { LedgerGridColumn } from '../types'

interface Row {
  id: string
  mrr: number
  growth: number
  name: string
}

const rows: Row[] = [
  { id: 'a', mrr: 100, growth: 10, name: 'A' },
  { id: 'b', mrr: 300, growth: -4, name: 'B' },
  { id: 'c', mrr: 200, growth: 6, name: 'C' },
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
  const columns: LedgerGridColumn<Row>[] = [
    { id: 'name', accessorKey: 'name', header: 'Name', type: 'text' },
    { id: 'mrr', accessorKey: 'mrr', header: 'MRR', type: 'currency', aggregate: 'sum' },
    { id: 'growth', accessorKey: 'growth', header: 'Growth', type: 'percent', aggregate: 'avg' },
  ]

  it('aggregates only columns that declare an aggregate', () => {
    const result = computeAggregates(columns, rows)
    expect(Object.keys(result).sort()).toEqual(['growth', 'mrr'])
    expect(result.mrr).toMatchObject({ kind: 'sum', value: 600, formatted: '$600' })
    expect(result.growth).toMatchObject({ kind: 'avg', value: 4, formatted: '4%' })
  })

  it('handles an empty row set', () => {
    const result = computeAggregates(columns, [])
    expect(result.mrr.value).toBeNull()
    expect(result.mrr.formatted).toBe('—')
  })
})
