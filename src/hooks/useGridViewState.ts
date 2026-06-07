import { useReducer } from 'react'
import { gridReducer } from '../components/DataGrid/reducers'
import type { GridAction, LedgerGridColumn, LedgerGridState } from '../components/DataGrid/types'

export interface GridViewStateApi {
  state: LedgerGridState
  dispatch: (action: GridAction) => void
}

export function useGridViewState<TData>(seed: LedgerGridState, columns: LedgerGridColumn<TData>[] = []): GridViewStateApi {
  const [state, dispatch] = useReducer((current: LedgerGridState, action: GridAction) => gridReducer(current, action, columns), seed)
  return { state, dispatch }
}
