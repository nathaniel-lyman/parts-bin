import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PERSISTED_VIEW } from '../components/DataGrid/persistence'
import { SAVED_VIEWS_KEY, exportViewsJson, importViewsJson, useSavedViews } from './useSavedViews'

describe('useSavedViews', () => {
  it('creates, renames, removes, and persists named views', () => {
    const { result } = renderHook(() => useSavedViews())

    let id = ''
    act(() => { id = result.current.create('Risk', DEFAULT_PERSISTED_VIEW) })
    expect(result.current.views[0]).toMatchObject({ id, name: 'Risk' })
    expect(JSON.parse(localStorage.getItem(SAVED_VIEWS_KEY)!)[0].name).toBe('Risk')

    act(() => result.current.rename(id, 'Revenue'))
    expect(result.current.views[0].name).toBe('Revenue')

    act(() => result.current.remove(id))
    expect(result.current.views).toEqual([])
  })

  it('applies stored views and resets without writing the grid key directly', () => {
    const { result } = renderHook(() => useSavedViews())
    const applied: unknown[] = []

    let id = ''
    act(() => { id = result.current.create('Comfort', { ...DEFAULT_PERSISTED_VIEW, density: 'comfortable' }) })
    act(() => result.current.apply(id, (view) => applied.push(view)))
    act(() => result.current.reset((view) => applied.push(view)))

    expect(applied).toHaveLength(2)
    expect(localStorage.getItem('ledger.accounts.grid')).toBeNull()
  })

  it('round-trips JSON helper output', () => {
    const views = [{ id: 'v1', name: 'A', view: DEFAULT_PERSISTED_VIEW }]
    expect(importViewsJson(exportViewsJson(views))).toEqual(views)
    expect(importViewsJson('{not json')).toEqual([])
    expect(importViewsJson('{"foo":1}')).toEqual([])
  })
})
