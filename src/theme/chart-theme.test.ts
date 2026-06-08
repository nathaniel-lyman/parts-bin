import { expect, test } from 'vitest'
import { SERIES } from './chart-theme'

test('first chart series are distinct categorical colors', () => {
  expect(new Set(SERIES.slice(0, 3)).size).toBe(3)
  expect(SERIES.slice(0, 3)).toEqual(['#2545ff', '#00a6c2', '#7c4dff'])
})
