import { describe, expect, it } from 'vitest'
import { keyToIntent, moveFocus, type GridDims, type GridFocus, type KeyEventLike } from '../keyboard'

const dims: GridDims = { rowCount: 5, colCount: 4, pageRows: 3 }
const ev = (event: Partial<KeyEventLike>): KeyEventLike => ({
  key: '',
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  ...event,
})

describe('moveFocus', () => {
  const at: GridFocus = { row: 2, col: 1 }

  it('moves and clamps through rows and columns', () => {
    expect(moveFocus(at, 'ArrowDown', dims)).toEqual({ row: 3, col: 1 })
    expect(moveFocus({ row: 4, col: 1 }, 'ArrowDown', dims)).toEqual({ row: 4, col: 1 })
    expect(moveFocus({ row: 0, col: 1 }, 'ArrowUp', dims)).toEqual({ row: -1, col: 1 })
    expect(moveFocus(at, 'ArrowRight', dims)).toEqual({ row: 2, col: 2 })
    expect(moveFocus({ row: 2, col: 0 }, 'ArrowLeft', dims)).toEqual({ row: 2, col: 0 })
  })

  it('handles Home, End, PageUp, and PageDown', () => {
    expect(moveFocus(at, 'Home', dims)).toEqual({ row: 2, col: 0 })
    expect(moveFocus(at, 'End', dims)).toEqual({ row: 2, col: 3 })
    expect(moveFocus(at, 'Home', dims, { ctrl: true })).toEqual({ row: 0, col: 0 })
    expect(moveFocus(at, 'End', dims, { ctrl: true })).toEqual({ row: 4, col: 3 })
    expect(moveFocus({ row: 0, col: 1 }, 'PageDown', dims)).toEqual({ row: 3, col: 1 })
    expect(moveFocus({ row: 4, col: 2 }, 'PageUp', dims)).toEqual({ row: 1, col: 2 })
  })
})

describe('keyToIntent', () => {
  it('maps primary keyboard workflows', () => {
    expect(keyToIntent(ev({ key: ' ' }))).toBe('toggle-select')
    expect(keyToIntent(ev({ key: 'Enter' }))).toBe('primary-action')
    expect(keyToIntent(ev({ key: 'Escape' }))).toBe('close-menu')
    expect(keyToIntent(ev({ key: 'ArrowDown' }))).toBe('move')
    expect(keyToIntent(ev({ key: 'ArrowRight', ctrlKey: true, shiftKey: true }))).toBe('reorder-next')
    expect(keyToIntent(ev({ key: 'ArrowLeft', metaKey: true, shiftKey: true }))).toBe('reorder-prev')
    expect(keyToIntent(ev({ key: 'ArrowRight', ctrlKey: true }))).toBe('resize-grow')
    expect(keyToIntent(ev({ key: 'ArrowLeft', ctrlKey: true }))).toBe('resize-shrink')
    expect(keyToIntent(ev({ key: 'Tab' }))).toBe('none')
  })
})
