import { useCallback, useReducer } from 'react'
import { hydrateView } from '../components/DataGrid/persistence'
import { gridReducer } from '../components/DataGrid/reducers'
import type { PersistedGridView } from '../components/DataGrid/persistence'
import type { GridAction, LedgerGridColumn, LedgerGridState } from '../components/DataGrid/types'

export interface GridViewStateApi {
  state: LedgerGridState
  dispatch: (action: GridAction) => void
  applyView: (view: PersistedGridView) => void
}

export function useGridViewState<TData>(seed: LedgerGridState, columns: LedgerGridColumn<TData>[] = []): GridViewStateApi {
  const [state, dispatch] = useReducer((current: LedgerGridState, action: GridAction) => gridReducer(current, action, columns), seed)
  const applyView = useCallback((view: PersistedGridView) => {
    dispatch({ type: 'APPLY_VIEW', state: hydrateView(view) })
  }, [])
  return { state, dispatch, applyView }
}
