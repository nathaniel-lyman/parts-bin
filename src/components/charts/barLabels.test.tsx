import { describe, expect, test } from 'vitest'
import { formatBarLabelValue, getBarLabelOrientation } from './barLabelUtils'

describe('bar label helpers', () => {
  test('formats movement values compactly with signs', () => {
    expect(formatBarLabelValue(7.1)).toBe('+7.1')
    expect(formatBarLabelValue(4)).toBe('+4')
    expect(formatBarLabelValue(-0.5)).toBe('-0.5')
    expect(formatBarLabelValue(0)).toBe('')
  })

  test('keeps labels out of cramped bar segments', () => {
    expect(getBarLabelOrientation({ x: 0, y: 0, width: 42, height: 18 }, '+7.1')).toBe('horizontal')
    expect(getBarLabelOrientation({ x: 0, y: 0, width: 22, height: 46 }, '+7.1')).toBe('vertical')
    expect(getBarLabelOrientation({ x: 0, y: 0, width: 12, height: 12 }, '+7.1')).toBeNull()
  })
})
