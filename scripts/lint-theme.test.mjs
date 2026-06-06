import { expect, test } from 'vitest'
import { findRawColors } from './lint-theme.mjs'

test('flags hex colors in non-theme files', () => {
  const hits = findRawColors('src/components/Bad.tsx', 'const c = "#ff0000"')
  expect(hits.length).toBe(1)
})

test('flags rgb()/hsl() colors', () => {
  expect(findRawColors('x.tsx', 'color: rgb(1,2,3)').length).toBe(1)
  expect(findRawColors('x.tsx', 'color: hsl(1,2%,3%)').length).toBe(1)
})

test('ignores files inside src/theme/', () => {
  expect(findRawColors('src/theme/tokens.css', '#ffffff').length).toBe(0)
})

test('does not flag var(--token) usage', () => {
  expect(findRawColors('x.tsx', 'fill: var(--accent)').length).toBe(0)
})
