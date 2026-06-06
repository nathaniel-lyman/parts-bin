import { expect, test } from 'vitest'
import { fmtCurrency, fmtPercent, fmtNum, fmtDelta } from './format'

test('fmtCurrency adds $ and thousands separators, no decimals', () => {
  expect(fmtCurrency(78300)).toBe('$78,300')
  expect(fmtCurrency(1400)).toBe('$1,400')
})
test('fmtNum groups thousands', () => {
  expect(fmtNum(12345)).toBe('12,345')
})
test('fmtPercent fixes one decimal with sign-less magnitude', () => {
  expect(fmtPercent(3.7)).toBe('3.7%')
})
test('fmtDelta pairs glyph with magnitude', () => {
  expect(fmtDelta(4.6)).toBe('▲ 4.6%')
  expect(fmtDelta(-2.1)).toBe('▼ 2.1%')
})
test('fmtDelta treats zero as up (non-negative glyph)', () => {
  expect(fmtDelta(0)).toBe('▲ 0.0%')
})
test('fmtCurrency rounds to whole dollars', () => {
  expect(fmtCurrency(1234.6)).toBe('$1,235')
})
test('fmtCurrency renders negatives', () => {
  expect(fmtCurrency(-5000)).toBe('$-5,000')
})
