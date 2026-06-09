import { expect, test } from 'vitest'
import { SERIES } from './chart-theme'

test('SERIES[0] tracks the accent token so the first series re-skins (RETHEME.md)', () => {
  expect(SERIES[0]).toBe('var(--accent)')
})

test('categorical SERIES[1..] stay distinct fixed hex, free of semantic state meaning', () => {
  const rest = SERIES.slice(1)
  expect(new Set(rest).size).toBe(rest.length)
  for (const color of rest) expect(color).toMatch(/^#[0-9a-f]{6}$/)
})
