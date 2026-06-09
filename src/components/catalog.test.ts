import { describe, expect, test } from 'vitest'
import * as barrel from './index'
import { CATALOG, INTERNAL, NON_COMPONENT_OVERRIDES } from './catalog'

/** Catalog-eligible = a function export whose name starts uppercase. */
function isEligible(name: string, value: unknown): boolean {
  return typeof value === 'function' && /^[A-Z]/.test(name)
}

const eligible = Object.entries(barrel).filter(([n, v]) => isEligible(n, v))

describe('component catalog', () => {
  const cataloged = new Set(CATALOG.map((e) => e.component))

  // The forcing function — and the worklist generator. When CATALOG is empty,
  // the failure message lists every component that needs classifying.
  test('every catalog-eligible export is cataloged or INTERNAL', () => {
    const undecided = eligible
      .filter(
        ([name, value]) =>
          !NON_COMPONENT_OVERRIDES.has(name) &&
          !cataloged.has(value as never) &&
          !INTERNAL.has(name),
      )
      .map(([name]) => name)
      .sort()
    expect(undecided, 'Classify each: add a CATALOG entry or an INTERNAL entry').toEqual([])
  })

  test('no orphan entries: every CATALOG.component is exported from ./index', () => {
    const exported = new Set(Object.values(barrel))
    const orphans = CATALOG.filter((e) => !exported.has(e.component as never)).map((e) => e.name)
    expect(orphans).toEqual([])
  })

  test('no stale INTERNAL entries: every key is a current eligible export', () => {
    const stale = [...INTERNAL.keys()].filter(
      (name) => !isEligible(name, (barrel as Record<string, unknown>)[name]),
    )
    expect(stale).toEqual([])
  })

  test('related / prefer_over reference cataloged names only', () => {
    const names = new Set(CATALOG.map((e) => e.name))
    const bad: string[] = []
    for (const e of CATALOG) {
      for (const r of e.related ?? []) if (!names.has(r)) bad.push(`${e.name}.related -> ${r}`)
      for (const t of Object.keys(e.prefer_over ?? {}))
        if (!names.has(t)) bad.push(`${e.name}.prefer_over -> ${t}`)
    }
    expect(bad).toEqual([])
  })

  test('every entry has non-empty purpose, use_when, and snippet', () => {
    const incomplete = CATALOG.filter(
      (e) => !e.purpose.trim() || !e.use_when.trim() || !e.snippet.trim(),
    ).map((e) => e.name)
    expect(incomplete).toEqual([])
  })

  test('every entry name matches a barrel export of the same identity', () => {
    const mismatched = CATALOG.filter(
      (e) => (barrel as Record<string, unknown>)[e.name] !== e.component,
    ).map((e) => e.name)
    expect(mismatched).toEqual([])
  })
})
