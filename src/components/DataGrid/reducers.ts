import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import { arrayMove } from '@dnd-kit/sortable'
import {
  ACTIONS_COLUMN_ID,
  normalizeColumnOrder,
  normalizePinning,
  normalizeSorting,
  normalizeState,
} from './normalize'
import { DEFAULT_COLUMN_VISIBILITY } from './state'
import type { FilterValue } from './filtering'
import type { ColumnPinning, Density, GridAction, DataGridColumn, DataGridState } from './types'

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
  columns: DataGridColumn<TData>[] = [],
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

export function columnOrderReducer<TData>(
  slice: string[],
  action: GridAction,
  columns: DataGridColumn<TData>[] = [],
): string[] {
  const columnIds = columns.map((column) => column.id)
  switch (action.type) {
    case 'SET_COLUMN_ORDER':
      return normalizeColumnOrder(action.columnOrder, columnIds)
    case 'REORDER_COLUMN': {
      const { activeId, overId } = action
      if (activeId === overId) return slice
      if (activeId === ACTIONS_COLUMN_ID || overId === ACTIONS_COLUMN_ID) return slice
      const knownIds = columnIds.length ? columnIds : slice
      if (!knownIds.includes(activeId) || !knownIds.includes(overId)) return slice
      const normalized = normalizeColumnOrder(slice, knownIds)
      const oldIndex = normalized.indexOf(activeId)
      const newIndex = normalized.indexOf(overId)
      if (oldIndex < 0 || newIndex < 0) return slice
      return normalizeColumnOrder(arrayMove(normalized, oldIndex, newIndex), knownIds)
    }
    case 'RESET_COLUMNS':
      return normalizeColumnOrder([], columnIds)
    default:
      return slice
  }
}

export function columnVisibilityReducer(slice: Record<string, boolean>, action: GridAction): Record<string, boolean> {
  switch (action.type) {
    case 'SET_COLUMN_VISIBILITY': {
      const next = { ...action.columnVisibility }
      if (next[ACTIONS_COLUMN_ID] === false) next[ACTIONS_COLUMN_ID] = true
      return next
    }
    case 'TOGGLE_COLUMN_VISIBILITY': {
      if (action.id === ACTIONS_COLUMN_ID) return slice
      const current = slice[action.id] ?? true
      return { ...slice, [action.id]: !current }
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
  slice: DataGridState['rowSelection'],
  action: GridAction,
): DataGridState['rowSelection'] {
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
  slice: DataGridState['rowPinning'],
  action: GridAction,
): DataGridState['rowPinning'] {
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

export function paginationReducer(
  slice: DataGridState['pagination'],
  action: GridAction,
): DataGridState['pagination'] {
  switch (action.type) {
    case 'SET_PAGE_INDEX':
      return { ...slice, pageIndex: Math.max(0, action.pageIndex) }
    case 'SET_PAGE_SIZE':
      return { pageIndex: 0, pageSize: action.pageSize }
    default:
      return slice
  }
}

export function groupingReducer(slice: string[], action: GridAction): string[] {
  switch (action.type) {
    case 'SET_GROUPING':
      return action.grouping.filter((id) => id !== ACTIONS_COLUMN_ID)
    case 'TOGGLE_GROUP_BY':
      if (action.columnId === ACTIONS_COLUMN_ID) return slice
      return slice.includes(action.columnId)
        ? slice.filter((id) => id !== action.columnId)
        : [...slice, action.columnId]
    case 'CLEAR_GROUPING':
    case 'RESET_COLUMNS':
      return []
    default:
      return slice
  }
}

export function numberFormatsReducer(
  slice: DataGridState['numberFormats'],
  action: GridAction,
): DataGridState['numberFormats'] {
  switch (action.type) {
    case 'SET_COLUMN_NUMBER_FORMAT':
      return { ...slice, [action.columnId]: action.format }
    case 'CLEAR_COLUMN_NUMBER_FORMAT': {
      if (!(action.columnId in slice)) return slice
      const next = { ...slice }
      delete next[action.columnId]
      return next
    }
    case 'RESET_COLUMNS':
      return {}
    default:
      return slice
  }
}

export function expandedReducer(
  slice: DataGridState['expanded'],
  action: GridAction,
  nextGrouping?: string[],
): DataGridState['expanded'] {
  switch (action.type) {
    case 'SET_EXPANDED':
      return action.expanded
    case 'EXPAND_ALL':
      return true
    case 'COLLAPSE_ALL':
      return {}
    case 'SET_GROUPING':
    case 'TOGGLE_GROUP_BY':
      // Grouping changed: expand everything when grouped, reset when ungrouped.
      return nextGrouping && nextGrouping.length > 0 ? true : {}
    case 'CLEAR_GROUPING':
    case 'RESET_COLUMNS':
      return {}
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
  state: DataGridState,
  action: GridAction,
  columns: DataGridColumn<TData>[] = [],
): DataGridState {
  const columnIds = columns.map((column) => column.id)
  switch (action.type) {
    case 'APPLY_VIEW':
      return normalizeState(action.state, columnIds)
    case 'SET_SORTING':
      return { ...state, sorting: sortingReducer(state.sorting, action.sorting) }
    case 'SET_GLOBAL_FILTER':
      return { ...state, globalFilter: globalFilterReducer(state.globalFilter, action.value), pagination: { ...state.pagination, pageIndex: 0 } }
    case 'SET_COLUMN_FILTER':
      return { ...state, columnFilters: columnFiltersReducer(state.columnFilters, action, 'set'), pagination: { ...state.pagination, pageIndex: 0 } }
    case 'CLEAR_COLUMN_FILTER':
      return { ...state, columnFilters: columnFiltersReducer(state.columnFilters, action, 'clear'), pagination: { ...state.pagination, pageIndex: 0 } }
    case 'SET_COLUMN_FILTERS':
      return { ...state, columnFilters: action.columnFilters, pagination: { ...state.pagination, pageIndex: 0 } }
    case 'SET_COLUMN_VISIBILITY':
      return normalizeState({
        ...state,
        columnVisibility: columnVisibilityReducer(state.columnVisibility, action),
      }, columnIds)
    case 'SET_COLUMN_ORDER':
      return normalizeState({
        ...state,
        columnOrder: columnOrderReducer(state.columnOrder, action, columns),
      }, columnIds)
    case 'RESIZE_COLUMN':
    case 'RESET_COLUMN_WIDTH':
      return { ...state, columnSizing: columnSizingReducer(state.columnSizing, action, columns) }
    case 'REORDER_COLUMN':
    case 'TOGGLE_COLUMN_VISIBILITY':
    case 'SET_DENSITY':
    case 'PIN_COLUMN':
    case 'UNPIN_COLUMN':
    case 'RESET_COLUMNS':
      return normalizeState({
        ...state,
        columnOrder: columnOrderReducer(state.columnOrder, action, columns),
        columnVisibility: columnVisibilityReducer(state.columnVisibility, action),
        columnSizing: columnSizingReducer(state.columnSizing, action, columns),
        columnPinning: columnPinningReducer(state.columnPinning, action),
        density: densityReducer(state.density, action),
        grouping: groupingReducer(state.grouping, action),
        numberFormats: numberFormatsReducer(state.numberFormats, action),
        expanded: action.type === 'RESET_COLUMNS' ? {} : state.expanded,
      }, columnIds)
    case 'SET_GROUPING':
    case 'TOGGLE_GROUP_BY':
    case 'CLEAR_GROUPING': {
      const grouping = groupingReducer(state.grouping, action)
      return normalizeState({
        ...state,
        grouping,
        expanded: expandedReducer(state.expanded, action, grouping),
        pagination: { ...state.pagination, pageIndex: 0 },
      }, columnIds)
    }
    case 'SET_EXPANDED':
    case 'EXPAND_ALL':
    case 'COLLAPSE_ALL':
      return { ...state, expanded: expandedReducer(state.expanded, action) }
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
    case 'SET_COLUMN_NUMBER_FORMAT':
    case 'CLEAR_COLUMN_NUMBER_FORMAT':
      return normalizeState({
        ...state,
        numberFormats: numberFormatsReducer(state.numberFormats, action),
      }, columnIds)
    case 'SET_PAGE_INDEX':
    case 'SET_PAGE_SIZE':
      return { ...state, pagination: paginationReducer(state.pagination, action) }
    default:
      return state
  }
}

export const rootReducer = gridReducer
