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

  it('compares dates chronologically, not lexically', () => {
    expect(makeFilterFn('date', 'before', '2021-06-01')('2021-01-15')).toBe(true)
    expect(makeFilterFn('date', 'before', '2021-06-01')('2021-12-15')).toBe(false)
    expect(makeFilterFn('date', 'after', '2021-06-01')('2021-12-15')).toBe(true)
  })

  it('parses mismatched date formats (US vs ISO) instead of string-comparing them', () => {
    // Lexically "02/01/2021" < "2021-01-01" (starts with '0'), so a string compare would wrongly say
    // Feb 1 2021 is NOT after Jan 1 2021. Parsing to timestamps gets the chronology right.
    expect(makeFilterFn('date', 'after', '2021-01-01')('02/01/2021')).toBe(true)
    expect(makeFilterFn('date', 'after', '2021-01-01')('12/31/2020')).toBe(false)
  })

  it('date between is inclusive and drops unparseable / blank cells', () => {
    const between = makeFilterFn('date', 'between', ['2021-01-01', '2021-12-31'])
    expect(between('2021-06-15')).toBe(true)
    expect(between('2021-01-01')).toBe(true)
    expect(between('2022-01-01')).toBe(false)
    expect(between('')).toBe(false)
    expect(between('not a date')).toBe(false)
  })
})
