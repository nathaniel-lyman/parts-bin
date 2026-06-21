import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GRID_STORAGE_KEY, GRID_VIEW_VERSION, LEGACY_GRID_STORAGE_KEY } from '../components/DataGrid/persistence'
import { DEFAULT_STATE } from '../components/DataGrid/state'
import { bootGridSeed, useGridPersistence } from './useGridPersistence'

describe('bootGridSeed', () => {
  it('reads the neutral default grid key when present and hydrates it', () => {
    localStorage.setItem(
      GRID_STORAGE_KEY,
      JSON.stringify({ version: GRID_VIEW_VERSION, density: 'standard', columnVisibility: { arr: true } }),
    )
    const seed = bootGridSeed()
    expect(seed.density).toBe('standard')
    expect(seed.columnVisibility.arr).toBe(true)
  })

  it('reads the provided grid key instead of the neutral default key', () => {
    localStorage.setItem(
      'workspace.grid',
      JSON.stringify({ version: GRID_VIEW_VERSION, density: 'comfortable', columnVisibility: { score: true } }),
    )
    localStorage.setItem(
      GRID_STORAGE_KEY,
      JSON.stringify({ version: GRID_VIEW_VERSION, density: 'compact', columnVisibility: { arr: true } }),
    )

    const seed = bootGridSeed(undefined, 'workspace.grid')
    expect(seed.density).toBe('comfortable')
    expect(seed.columnVisibility.score).toBe(true)
    expect(seed.columnVisibility.arr).toBeUndefined()
  })

  it('runs account migration only when the legacy account grid key is requested', () => {
    localStorage.setItem('ledger.cols', JSON.stringify({ name: false }))
    const seed = bootGridSeed(undefined, LEGACY_GRID_STORAGE_KEY)
    expect(seed.columnVisibility.account).toBe(false)
    expect(localStorage.getItem('ledger.cols')).toBe(JSON.stringify({ name: false }))
  })

  it('absent neutral grid key ignores legacy account data and yields DEFAULT_STATE', () => {
    localStorage.setItem('ledger.cols', JSON.stringify({ name: false }))
    expect(bootGridSeed()).toEqual(DEFAULT_STATE)
  })
})

describe('useGridPersistence (debounced write of projection)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('writes project(state) to the neutral default grid key after the debounce', () => {
    const state = { ...DEFAULT_STATE, density: 'comfortable' as const }
    renderHook(() => useGridPersistence(state, true))
    expect(localStorage.getItem(GRID_STORAGE_KEY)).toBeNull()
    act(() => vi.advanceTimersByTime(500))
    const written = JSON.parse(localStorage.getItem(GRID_STORAGE_KEY)!)
    expect(written.version).toBe(GRID_VIEW_VERSION)
    expect(written.density).toBe('comfortable')
    expect('globalFilter' in written).toBe(false)
  })

  it('writes to the provided grid key after the debounce', () => {
    const state = { ...DEFAULT_STATE, density: 'comfortable' as const }
    renderHook(() => useGridPersistence(state, true, 'workspace.grid'))
    act(() => vi.advanceTimersByTime(500))
    expect(localStorage.getItem(GRID_STORAGE_KEY)).toBeNull()
    const written = JSON.parse(localStorage.getItem('workspace.grid')!)
    expect(written.version).toBe(GRID_VIEW_VERSION)
    expect(written.density).toBe('comfortable')
  })

  it('does not write when disabled (controlled mode)', () => {
    const state = { ...DEFAULT_STATE, density: 'comfortable' as const }
    renderHook(() => useGridPersistence(state, false))
    act(() => vi.advanceTimersByTime(500))
    expect(localStorage.getItem(GRID_STORAGE_KEY)).toBeNull()
  })
})
