import { describe, expect, it } from 'vitest'
import { selectAllState, selectionCount } from '../selectors'

describe('selectionCount', () => {
  it('counts selected keys', () => {
    expect(selectionCount({ a1: true, a2: true })).toBe(2)
    expect(selectionCount({})).toBe(0)
  })
})

describe('selectAllState', () => {
  it('returns none, some, and all over visible ids', () => {
    expect(selectAllState({}, ['a1', 'a2'])).toBe('none')
    expect(selectAllState({ a1: true }, ['a1', 'a2'])).toBe('some')
    expect(selectAllState({ a1: true, a2: true, z9: true }, ['a1', 'a2'])).toBe('all')
    expect(selectAllState({ z9: true }, [])).toBe('none')
  })
})
