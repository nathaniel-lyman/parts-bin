import { describe, expect, it } from 'vitest'
import { resolveCopyIntent } from '../keyboard'

describe('resolveCopyIntent', () => {
  it('returns selection for Ctrl/Cmd+C when rows are selected', () => {
    expect(resolveCopyIntent({ key: 'c', ctrlKey: true, metaKey: false }, { hasSelection: true })).toBe('selection')
    expect(resolveCopyIntent({ key: 'C', ctrlKey: false, metaKey: true }, { hasSelection: true })).toBe('selection')
  })

  it('returns cell when nothing is selected', () => {
    expect(resolveCopyIntent({ key: 'c', ctrlKey: false, metaKey: true }, { hasSelection: false })).toBe('cell')
  })

  it('returns null for non-copy combos or editable targets', () => {
    expect(resolveCopyIntent({ key: 'v', ctrlKey: true, metaKey: false }, { hasSelection: true })).toBeNull()
    expect(resolveCopyIntent({ key: 'c', ctrlKey: false, metaKey: false }, { hasSelection: true })).toBeNull()
    expect(resolveCopyIntent({ key: 'c', ctrlKey: true, metaKey: false }, { hasSelection: true, inEditableTarget: true })).toBeNull()
  })
})
