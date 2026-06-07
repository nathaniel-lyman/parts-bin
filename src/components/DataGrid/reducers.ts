import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { arrayMove } from '@dnd-kit/sortable'
import {
  ACTIONS_COLUMN_ID,
  DEFAULT_COLUMN_ORDER,
  isMovableColumnId,
  normalizeColumnOrder,
  normalizePinning,
  normalizeSorting,
  normalizeState,
} from './normalize'
import { DEFAULT_COLUMN_VISIBILITY } from './state'
import type { FilterValue } from './filtering'
import type { ColumnPinning, Density, GridAction, LedgerGridColumn, LedgerGridState } from './types'

export const sortingReducer = (_slice: SortingState, sorting: SortingState): SortingState => sorting
export const globalFilterReducer = (_slice: string, globalFilter: string): string => globalFilter

export function columnFiltersReducer(
  slice: ColumnFiltersState,
  action: { columnId: string; value?: FilterValue },
  mode: 'set' | 'clear',
): ColumnFiltersState {
  const without = slice.filter((filter) => filter.id !== action.columnId)
  if (mode === 'clear') return without
  return [...without, { id: action.columnId, value: action.value }]
}

export function columnSizingReducer<TData>(
  slice: Record<string, number>,
  action: GridAction,
  columns: LedgerGridColumn<TData>[] = [],
): Record<string, number> {
  switch (action.type) {
    case 'RESIZE_COLUMN': {
      const column = columns.find((candidate) => candidate.id === action.id)
      const min = column?.minWidth ?? 1
      const max = column?.maxWidth ?? Number.POSITIVE_INFINITY
      const width = Math.min(Math.max(action.width, min), max)
      return { ...slice, [action.id]: width }
    }
    case 'RESET_COLUMN_WIDTH': {
      if (!(action.id in slice)) return slice
      const next = { ...slice }
      delete next[action.id]
      return next
    }
    case 'RESET_COLUMNS':
      return {}
    default:
      return slice
  }
}

export function columnOrderReducer(slice: string[], action: GridAction): string[] {
  switch (action.type) {
    case 'setColumnOrder':
      return normalizeColumnOrder(action.columnOrder)
    case 'REORDER_COLUMN': {
      const { activeId, overId } = action
      if (activeId === overId) return slice
      if (activeId === ACTIONS_COLUMN_ID || overId === ACTIONS_COLUMN_ID) return slice
      if (!isMovableColumnId(activeId) || !isMovableColumnId(overId)) return slice
      const normalized = normalizeColumnOrder(slice)
      const oldIndex = normalized.indexOf(activeId)
      const newIndex = normalized.indexOf(overId)
      if (oldIndex < 0 || newIndex < 0) return slice
      return normalizeColumnOrder(arrayMove(normalized, oldIndex, newIndex))
    }
    case 'RESET_COLUMNS':
      return [...DEFAULT_COLUMN_ORDER]
    default:
      return slice
  }
}

export function columnVisibilityReducer(slice: Record<string, boolean>, action: GridAction): Record<string, boolean> {
  switch (action.type) {
    case 'setColumnVisibility': {
      const next = { ...action.columnVisibility }
      if (next[ACTIONS_COLUMN_ID] === false) next[ACTIONS_COLUMN_ID] = true
      return next
    }
    case 'TOGGLE_COLUMN_VISIBILITY': {
      if (action.id === ACTIONS_COLUMN_ID) return slice
      const current = slice[action.id] ?? true
      return { ...slice, [action.id]: !current }
    }
    case 'SET_COLUMN_VISIBILITY': {
      const merged = { ...slice, ...action.visibility }
      if (merged[ACTIONS_COLUMN_ID] === false) merged[ACTIONS_COLUMN_ID] = true
      return merged
    }
    case 'RESET_COLUMNS':
      return { ...DEFAULT_COLUMN_VISIBILITY }
    default:
      return slice
  }
}

export function densityReducer(slice: Density, action: GridAction): Density {
  switch (action.type) {
    case 'SET_DENSITY':
      return action.density
    case 'RESET_COLUMNS':
      return 'compact'
    default:
      return slice
  }
}

export function columnPinningReducer(slice: ColumnPinning, action: GridAction): ColumnPinning {
  switch (action.type) {
    case 'PIN_COLUMN': {
      if (action.id === ACTIONS_COLUMN_ID) return normalizePinning(slice)
      const left = slice.left.filter((id) => id !== action.id)
      const right = slice.right.filter((id) => id !== action.id)
      if (action.side === 'left') left.push(action.id)
      else right.push(action.id)
      return normalizePinning({ left, right })
    }
    case 'UNPIN_COLUMN': {
      if (action.id === ACTIONS_COLUMN_ID) return normalizePinning(slice)
      return normalizePinning({
        left: slice.left.filter((id) => id !== action.id),
        right: slice.right.filter((id) => id !== action.id),
      })
    }
    case 'RESET_COLUMNS':
      return { left: [], right: [ACTIONS_COLUMN_ID] }
    default:
      return slice
  }
}

export function rowSelectionReducer(
  slice: LedgerGridState['rowSelection'],
  action: GridAction,
): LedgerGridState['rowSelection'] {
  switch (action.type) {
    case 'TOGGLE_ROW': {
      const next = { ...slice }
      if (next[action.id]) delete next[action.id]
      else next[action.id] = true
      return next
    }
    case 'SELECT_ALL_VISIBLE': {
      const next = { ...slice }
      for (const id of action.ids) {
        if (action.select) next[id] = true
        else delete next[id]
      }
      return next
    }
    case 'CLEAR_SELECTION':
      return {}
    default:
      return slice
  }
}

export function rowPinningReducer(
  slice: LedgerGridState['rowPinning'],
  action: GridAction,
): LedgerGridState['rowPinning'] {
  switch (action.type) {
    case 'PIN_ROW_TOP':
      return {
        top: slice.top.includes(action.rowId) ? slice.top : [...slice.top, action.rowId],
        bottom: slice.bottom.filter((id) => id !== action.rowId),
      }
    case 'PIN_ROW_BOTTOM':
      return {
        top: slice.top.filter((id) => id !== action.rowId),
        bottom: slice.bottom.includes(action.rowId) ? slice.bottom : [...slice.bottom, action.rowId],
      }
    case 'UNPIN_ROW':
      return {
        top: slice.top.filter((id) => id !== action.rowId),
        bottom: slice.bottom.filter((id) => id !== action.rowId),
      }
    default:
      return slice
  }
}

function sortActionReducer(slice: SortingState, action: GridAction): SortingState {
  switch (action.type) {
    case 'SET_SORT': {
      const next = { id: action.id, desc: action.desc }
      return action.additive ? [...slice.filter((item) => item.id !== action.id), next] : [next]
    }
    case 'CLEAR_SORT':
      return slice.filter((item) => item.id !== action.id)
    default:
      return slice
  }
}

export function toggleSortingReducer(slice: SortingState, action: { columnId: string; multi: boolean }): SortingState {
  const existing = slice.find((item) => item.id === action.columnId)

  if (!action.multi) {
    if (!existing) return [{ id: action.columnId, desc: false }]
    if (existing.desc === false) return [{ id: action.columnId, desc: true }]
    return [{ id: action.columnId, desc: false }]
  }

  if (!existing) return [...slice, { id: action.columnId, desc: false }]
  if (existing.desc === false) {
    return slice.map((item) => (item.id === action.columnId ? { id: item.id, desc: true } : item))
  }
  return slice.map((item) => (item.id === action.columnId ? { id: item.id, desc: false } : item))
}

export function gridReducer<TData>(
  state: LedgerGridState,
  action: GridAction,
  columns: LedgerGridColumn<TData>[] = [],
): LedgerGridState {
  switch (action.type) {
    case 'setSorting':
      return { ...state, sorting: sortingReducer(state.sorting, action.sorting) }
    case 'setGlobalFilter':
      return { ...state, globalFilter: globalFilterReducer(state.globalFilter, action.globalFilter) }
    case 'SET_GLOBAL_FILTER':
      return { ...state, globalFilter: globalFilterReducer(state.globalFilter, action.value) }
    case 'SET_COLUMN_FILTER':
      return { ...state, columnFilters: columnFiltersReducer(state.columnFilters, action, 'set') }
    case 'CLEAR_COLUMN_FILTER':
      return { ...state, columnFilters: columnFiltersReducer(state.columnFilters, action, 'clear') }
    case 'SET_COLUMN_FILTERS':
      return { ...state, columnFilters: action.columnFilters }
    case 'setColumnVisibility':
      return normalizeState({
        ...state,
        columnVisibility: columnVisibilityReducer(state.columnVisibility, action),
      })
    case 'setColumnOrder':
      return normalizeState({
        ...state,
        columnOrder: columnOrderReducer(state.columnOrder, action),
      })
    case 'RESIZE_COLUMN':
    case 'RESET_COLUMN_WIDTH':
      return { ...state, columnSizing: columnSizingReducer(state.columnSizing, action, columns) }
    case 'REORDER_COLUMN':
    case 'TOGGLE_COLUMN_VISIBILITY':
    case 'SET_COLUMN_VISIBILITY':
    case 'SET_DENSITY':
    case 'PIN_COLUMN':
    case 'UNPIN_COLUMN':
    case 'RESET_COLUMNS':
      return normalizeState({
        ...state,
        columnOrder: columnOrderReducer(state.columnOrder, action),
        columnVisibility: columnVisibilityReducer(state.columnVisibility, action),
        columnSizing: columnSizingReducer(state.columnSizing, action, columns),
        columnPinning: columnPinningReducer(state.columnPinning, action),
        density: densityReducer(state.density, action),
      })
    case 'SET_SORT':
    case 'CLEAR_SORT':
      return { ...state, sorting: normalizeSorting(sortActionReducer(state.sorting, action)) }
    case 'TOGGLE_SORT':
      return { ...state, sorting: normalizeSorting(toggleSortingReducer(state.sorting, action)) }
    case 'TOGGLE_ROW':
    case 'SELECT_ALL_VISIBLE':
    case 'CLEAR_SELECTION':
      return { ...state, rowSelection: rowSelectionReducer(state.rowSelection, action) }
    case 'PIN_ROW_TOP':
    case 'PIN_ROW_BOTTOM':
    case 'UNPIN_ROW':
      return { ...state, rowPinning: rowPinningReducer(state.rowPinning, action) }
    default:
      return state
  }
}

export const rootReducer = gridReducer
