import { useCallback, useReducer } from 'react'
import { hydrateView, type PersistedGridView } from './persistence'
import { gridReducer } from './reducers'
import type { DataGridColumn, DataGridState, GridAction } from './types'

export interface GridViewStateApi {
  state: DataGridState
  dispatch: (action: GridAction) => void
  applyView: (view: PersistedGridView) => void
}

export function useGridViewState<TData>(seed: DataGridState, columns: DataGridColumn<TData>[] = []): GridViewStateApi {
  const [state, dispatch] = useReducer((current: DataGridState, action: GridAction) => gridReducer(current, action, columns), seed)
  const applyView = useCallback((view: PersistedGridView) => {
    dispatch({ type: 'APPLY_VIEW', state: hydrateView(view) })
  }, [])
  return { state, dispatch, applyView }
}
