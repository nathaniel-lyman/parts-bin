import { describe, expect, it } from 'vitest'
import { fitColumnWidth } from '../autofit'

describe('fitColumnWidth', () => {
  it('returns the widest content plus padding, rounded up', () => {
    expect(fitColumnWidth([40, 120, 88], { padding: 24 })).toBe(144)
  })

  it('clamps to the minimum when content is narrow', () => {
    expect(fitColumnWidth([10], { padding: 8, min: 48 })).toBe(48)
  })

  it('clamps to the maximum when content is very wide', () => {
    expect(fitColumnWidth([2000], { padding: 24, max: 600 })).toBe(600)
  })

  it('falls back to the minimum when there is no content', () => {
    expect(fitColumnWidth([], { min: 60 })).toBe(60)
  })
})
