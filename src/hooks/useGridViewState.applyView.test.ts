import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PERSISTED_VIEW } from '../components/DataGrid/persistence'
import { DEFAULT_STATE } from '../components/DataGrid/state'
import { useGridViewState } from './useGridViewState'

describe('useGridViewState.applyView', () => {
  it('hydrates a persisted view into live state and seeds transient fields', () => {
    const { result } = renderHook(() => useGridViewState(DEFAULT_STATE))

    act(() => result.current.applyView({
      ...DEFAULT_PERSISTED_VIEW,
      density: 'comfortable',
      pagination: { pageSize: 50 },
    }))

    expect(result.current.state.density).toBe('comfortable')
    expect(result.current.state.pagination).toEqual({ pageIndex: 0, pageSize: 50 })
    expect(result.current.state.rowSelection).toEqual({})
    expect(result.current.state.globalFilter).toBe('')
  })
})
