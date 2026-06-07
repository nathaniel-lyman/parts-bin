import { describe, expect, it } from 'vitest'
import { makeFilterFn } from '../filtering'

describe('DataGrid filtering engine', () => {
  it('matches text case-insensitively', () => {
    expect(makeFilterFn('text', 'contains', 'cob')('Cobalt Freight')).toBe(true)
    expect(makeFilterFn('text', 'startsWith', 'fre')('Cobalt Freight')).toBe(false)
  })

  it('compares numeric values', () => {
    expect(makeFilterFn('currency', 'greaterThan', '1000')(1200)).toBe(true)
    expect(makeFilterFn('percent', 'lessThan', 0)(4.2)).toBe(false)
  })

  it('matches enum sets', () => {
    const predicate = makeFilterFn('enum', 'isAnyOf', ['Enterprise', 'Startup'])
    expect(predicate('Startup')).toBe(true)
    expect(predicate('Mid-market')).toBe(false)
  })
})
