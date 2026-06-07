import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GRID_STORAGE_KEY, GRID_VIEW_VERSION } from '../components/DataGrid/persistence'
import { DEFAULT_STATE } from '../components/DataGrid/state'
import { bootGridSeed, useGridPersistence } from './useGridPersistence'

describe('bootGridSeed', () => {
  it('reads ledger.accounts.grid when present and hydrates it', () => {
    localStorage.setItem(
      GRID_STORAGE_KEY,
      JSON.stringify({ version: GRID_VIEW_VERSION, density: 'standard', columnVisibility: { arr: true } }),
    )
    const seed = bootGridSeed()
    expect(seed.density).toBe('standard')
    expect(seed.columnVisibility.arr).toBe(true)
  })

  it('runs migration (via legacy keys) when the grid key is absent', () => {
    localStorage.setItem('ledger.cols', JSON.stringify({ name: false }))
    const seed = bootGridSeed()
    expect(seed.columnVisibility.account).toBe(false)
    expect(localStorage.getItem('ledger.cols')).toBe(JSON.stringify({ name: false }))
  })

  it('absent grid key with no legacy data yields DEFAULT_STATE', () => {
    expect(bootGridSeed()).toEqual(DEFAULT_STATE)
  })
})

describe('useGridPersistence (debounced write of projection)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('writes project(state) to ledger.accounts.grid after the debounce', () => {
    const state = { ...DEFAULT_STATE, density: 'comfortable' as const }
    renderHook(() => useGridPersistence(state, true))
    expect(localStorage.getItem(GRID_STORAGE_KEY)).toBeNull()
    act(() => vi.advanceTimersByTime(500))
    const written = JSON.parse(localStorage.getItem(GRID_STORAGE_KEY)!)
    expect(written.version).toBe(GRID_VIEW_VERSION)
    expect(written.density).toBe('comfortable')
    expect('globalFilter' in written).toBe(false)
  })

  it('does not write when disabled (controlled mode)', () => {
    const state = { ...DEFAULT_STATE, density: 'comfortable' as const }
    renderHook(() => useGridPersistence(state, false))
    act(() => vi.advanceTimersByTime(500))
    expect(localStorage.getItem(GRID_STORAGE_KEY)).toBeNull()
  })
})

