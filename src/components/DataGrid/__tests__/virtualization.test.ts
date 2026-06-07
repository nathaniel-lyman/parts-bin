import { describe, expect, it } from 'vitest'
import { computeColumnRange, computeRange } from '../virtualization'

describe('computeRange', () => {
  it('returns the visible row window at the top with overscan', () => {
    expect(computeRange({ scrollOffset: 0, itemSize: 40, count: 1000, viewport: 400, overscan: 3 }))
      .toEqual({ start: 0, end: 13 })
  })

  it('shifts the row window in the middle with overscan on both sides', () => {
    expect(computeRange({ scrollOffset: 4000, itemSize: 40, count: 1000, viewport: 400, overscan: 3 }))
      .toEqual({ start: 97, end: 113 })
  })

  it('clamps the row window at the end', () => {
    expect(computeRange({ scrollOffset: 39600, itemSize: 40, count: 1000, viewport: 400, overscan: 5 }))
      .toEqual({ start: 985, end: 1000 })
  })

  it('returns an empty row range for invalid dimensions', () => {
    expect(computeRange({ scrollOffset: 0, itemSize: 0, count: 100, viewport: 400, overscan: 3 }))
      .toEqual({ start: 0, end: 0 })
  })
})

describe('computeColumnRange', () => {
  const widths = Array.from({ length: 10 }, () => 120)

  it('windows scrollable columns at offset zero', () => {
    expect(computeColumnRange({ widths, scrollOffset: 0, viewport: 360, overscan: 1 }))
      .toEqual({ start: 0, end: 4 })
  })

  it('uses cumulative widths when horizontally scrolled', () => {
    expect(computeColumnRange({ widths, scrollOffset: 600, viewport: 360, overscan: 1 }))
      .toEqual({ start: 4, end: 9 })
  })

  it('handles variable column widths', () => {
    const range = computeColumnRange({ widths: [200, 80, 80, 300, 120, 120], scrollOffset: 280, viewport: 200, overscan: 0 })
    expect(range.start).toBe(2)
    expect(range.end).toBeGreaterThanOrEqual(4)
    expect(range.end).toBeLessThanOrEqual(6)
  })

  it('returns an empty column range for no scrollable columns', () => {
    expect(computeColumnRange({ widths: [], scrollOffset: 0, viewport: 360, overscan: 2 }))
      .toEqual({ start: 0, end: 0 })
  })
})
