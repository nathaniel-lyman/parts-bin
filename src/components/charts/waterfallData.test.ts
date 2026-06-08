import { describe, expect, test } from 'vitest'
import { buildWaterfallData } from './waterfallData'

describe('buildWaterfallData', () => {
  test('turns start, delta, and total steps into range bars', () => {
    const result = buildWaterfallData([
      { label: 'Opening MRR', kind: 'start', value: 100 },
      { label: 'New', kind: 'increase', value: 12 },
      { label: 'Churn', kind: 'decrease', value: 5 },
      { label: 'Closing MRR', kind: 'total' },
    ])

    expect(result.data.map(({ label, kind, value, start, end, range }) => ({ label, kind, value, start, end, range }))).toEqual([
      { label: 'Opening MRR', kind: 'start', value: 100, start: 0, end: 100, range: [0, 100] },
      { label: 'New', kind: 'increase', value: 12, start: 100, end: 112, range: [100, 112] },
      { label: 'Churn', kind: 'decrease', value: -5, start: 112, end: 107, range: [107, 112] },
      { label: 'Closing MRR', kind: 'total', value: 107, start: 0, end: 107, range: [0, 107] },
    ])
    expect(result.summary).toEqual({ start: 100, end: 107, delta: 7, increase: 12, decrease: 5 })
  })

  test('supports explicit total checkpoints', () => {
    const result = buildWaterfallData([
      { label: 'Opening', kind: 'start', value: 50 },
      { label: 'Expansion', value: 8 },
      { label: 'Forecast total', kind: 'total', value: 60 },
      { label: 'Contraction', value: -3 },
      { label: 'Closing', kind: 'total' },
    ])

    expect(result.data[2]).toMatchObject({ label: 'Forecast total', kind: 'total', delta: 2, end: 60 })
    expect(result.summary).toMatchObject({ start: 50, end: 57, delta: 7, increase: 8, decrease: 3 })
  })

  test('rejects underspecified or non-finite input', () => {
    expect(() => buildWaterfallData([{ label: 'Opening', kind: 'start', value: 10 }])).toThrow(/start and a total/)
    expect(() => buildWaterfallData([
      { label: 'Opening', kind: 'start', value: 10 },
      { label: 'Broken', value: Number.NaN },
      { label: 'Closing', kind: 'total' },
    ])).toThrow(/Broken/)
  })
})
