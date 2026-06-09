import { expect, test } from 'vitest'
import { CATALOG } from '../catalog'
import { previews } from './previewRegistry'

test('every preview key is a cataloged component name', () => {
  const names = new Set(CATALOG.map((entry) => entry.name))
  const orphans = Object.keys(previews).filter((key) => !names.has(key))
  expect(orphans).toEqual([])
})
