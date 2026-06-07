import { describe, expect, it } from 'vitest'
import appSource from '../../../App.tsx?raw'
import { keyToIntent, type KeyEventLike } from '../keyboard'
import { ACTIONS_COLUMN_ID, normalizePinning } from '../normalize'

const legacyModules = import.meta.glob([
  '/src/components/DataTable/**',
  '/src/hooks/useColumnVisibility.ts',
  '/src/hooks/useColumnOrder.ts',
])

const ev = (event: Partial<KeyEventLike> & Pick<KeyEventLike, 'key'>): KeyEventLike => ({
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  ...event,
})

describe('DataGrid definition of done', () => {
  it('dashboard imports DataGrid and the retired table/hooks are absent', () => {
    expect(appSource).toContain("from './components/DataGrid/DataGrid'")
    expect(appSource).not.toContain('DataTable')
    expect(Object.keys(legacyModules)).toEqual([])
  })

  it('keeps the locked actions column last and right-pinned', () => {
    expect(normalizePinning({ left: [ACTIONS_COLUMN_ID, 'account'], right: ['owner'] })).toEqual({
      left: ['account'],
      right: ['owner', ACTIONS_COLUMN_ID],
    })
  })

  it('maps keyboard intents needed by navigation, selection, resize, and reorder affordances', () => {
    expect(keyToIntent(ev({ key: 'ArrowDown' }))).toBe('move')
    expect(keyToIntent(ev({ key: ' ' }))).toBe('toggle-select')
    expect(keyToIntent(ev({ key: 'Enter' }))).toBe('primary-action')
    expect(keyToIntent(ev({ key: 'Escape' }))).toBe('close-menu')
    expect(keyToIntent(ev({ key: 'ArrowRight', ctrlKey: true, shiftKey: true }))).toBe('reorder-next')
    expect(keyToIntent(ev({ key: 'ArrowLeft', metaKey: true, shiftKey: true }))).toBe('reorder-prev')
    expect(keyToIntent(ev({ key: 'ArrowRight', ctrlKey: true }))).toBe('resize-grow')
    expect(keyToIntent(ev({ key: 'ArrowLeft', metaKey: true }))).toBe('resize-shrink')
  })
})
