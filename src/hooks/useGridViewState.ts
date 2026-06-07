import { useReducer } from 'react'
import { gridReducer } from '../components/DataGrid/reducers'
import type { GridAction, LedgerGridState } from '../components/DataGrid/types'

export interface GridViewStateApi {
  state: LedgerGridState
  dispatch: (action: GridAction) => void
}

export function useGridViewState(seed: LedgerGridState): GridViewStateApi {
  const [state, dispatch] = useReducer(gridReducer, seed)
  return { state, dispatch }
}

