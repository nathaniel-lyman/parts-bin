import type { SortingState } from '@tanstack/react-table'
import { normalizeState } from './normalize'
import type { GridAction, LedgerGridState } from './types'

export const sortingReducer = (_slice: SortingState, sorting: SortingState): SortingState => sorting
export const globalFilterReducer = (_slice: string, globalFilter: string): string => globalFilter
export const columnVisibilityReducer = (
  _slice: Record<string, boolean>,
  columnVisibility: Record<string, boolean>,
): Record<string, boolean> => columnVisibility
export const columnOrderReducer = (_slice: string[], columnOrder: string[]): string[] => columnOrder

export function gridReducer(state: LedgerGridState, action: GridAction): LedgerGridState {
  switch (action.type) {
    case 'setSorting':
      return { ...state, sorting: sortingReducer(state.sorting, action.sorting) }
    case 'setGlobalFilter':
      return { ...state, globalFilter: globalFilterReducer(state.globalFilter, action.globalFilter) }
    case 'setColumnVisibility':
      return normalizeState({
        ...state,
        columnVisibility: columnVisibilityReducer(state.columnVisibility, action.columnVisibility),
      })
    case 'setColumnOrder':
      return normalizeState({
        ...state,
        columnOrder: columnOrderReducer(state.columnOrder, action.columnOrder),
      })
    default:
      return state
  }
}

