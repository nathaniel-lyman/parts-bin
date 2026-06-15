import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_STATE } from '../components/DataGrid/state'
import { useGridViewState } from './useGridViewState'

const accountColumns = ['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']
  .map((id) => ({ id, header: id }))

describe('useGridViewState (uncontrolled live state)', () => {
  it('initializes from the provided seed', () => {
    const { result } = renderHook(() => useGridViewState(DEFAULT_STATE))
    expect(result.current.state.density).toBe('compact')
  })

  it('dispatch routes through the root reducer (SET_GLOBAL_FILTER)', () => {
    const { result } = renderHook(() => useGridViewState(DEFAULT_STATE))
    act(() => result.current.dispatch({ type: 'SET_GLOBAL_FILTER', value: 'acme' }))
    expect(result.current.state.globalFilter).toBe('acme')
  })

  it('a violating columnOrder dispatch is a no-op (normalize forces actions last)', () => {
    const { result } = renderHook(() => useGridViewState(DEFAULT_STATE, accountColumns))
    act(() =>
      result.current.dispatch({
        type: 'SET_COLUMN_ORDER',
        columnOrder: ['actions', 'owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since'],
      }),
    )
    expect(result.current.state.columnOrder[result.current.state.columnOrder.length - 1]).toBe('actions')
  })
})
