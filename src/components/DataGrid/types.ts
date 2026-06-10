import type { ReactNode } from 'react'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import type { FilterColumnType, FilterValue } from './filtering'

export const DENSITIES = ['compact', 'standard', 'comfortable'] as const
export type Density = (typeof DENSITIES)[number]
export const DENSITY_LABELS: Record<Density, string> = {
  compact: 'Compact',
  standard: 'Standard',
  comfortable: 'Comfortable',
}

export type GridColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'status'
  | 'actions'

export interface LedgerCellContext<TData, TValue = unknown> {
  value: TValue
  row: TData
  rowId: string
}

export interface LedgerGridColumn<TData, TValue = unknown> {
  id: string
  accessorKey?: keyof TData
  accessorFn?: (row: TData) => TValue
  header: string | ReactNode
  cell?: (ctx: LedgerCellContext<TData, TValue>) => ReactNode
  width?: number
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'right' | 'center'
  meta?: {
    align?: 'left' | 'right' | 'center'
    resizable?: boolean
    type?: FilterColumnType
    options?: string[]
  }
  type?: GridColumnType
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  reorderable?: boolean
  pinnable?: boolean
  hideable?: boolean
  exportable?: boolean
}

export interface LedgerGridState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  columnVisibility: Record<string, boolean>
  columnOrder: string[]
  columnSizing: Record<string, number>
  columnPinning: ColumnPinning
  rowSelection: Record<string, boolean>
  rowPinning: { top: string[]; bottom: string[] }
  pagination: { pageIndex: number; pageSize: number }
  density: Density
}

export interface ColumnPinning {
  left: string[]
  right: string[]
}

export interface ColumnVirtualWindow {
  ids: string[]
  paddingLeft: number
  paddingRight: number
}

export type GridStatus = 'idle' | 'loading' | 'error'

export interface GridRuntimeStatus {
  status: GridStatus
  error?: unknown
}

export type GridAction =
  | { type: 'SET_SORTING'; sorting: SortingState }
  | { type: 'SET_COLUMN_VISIBILITY'; columnVisibility: Record<string, boolean> }
  | { type: 'SET_COLUMN_ORDER'; columnOrder: string[] }
  | { type: 'RESIZE_COLUMN'; id: string; width: number }
  | { type: 'RESET_COLUMN_WIDTH'; id: string }
  | { type: 'REORDER_COLUMN'; activeId: string; overId: string }
  | { type: 'TOGGLE_COLUMN_VISIBILITY'; id: string }
  | { type: 'RESET_COLUMNS' }
  | { type: 'SET_DENSITY'; density: Density }
  | { type: 'PIN_COLUMN'; id: string; side: 'left' | 'right' }
  | { type: 'UNPIN_COLUMN'; id: string }
  | { type: 'SET_SORT'; id: string; desc: boolean; additive: boolean }
  | { type: 'CLEAR_SORT'; id: string }
  | { type: 'TOGGLE_SORT'; columnId: string; multi: boolean }
  | { type: 'SET_COLUMN_FILTER'; columnId: string; value: FilterValue }
  | { type: 'CLEAR_COLUMN_FILTER'; columnId: string }
  | { type: 'SET_COLUMN_FILTERS'; columnFilters: ColumnFiltersState }
  | { type: 'SET_GLOBAL_FILTER'; value: string }
  | { type: 'TOGGLE_ROW'; id: string }
  | { type: 'SELECT_ALL_VISIBLE'; ids: string[]; select: boolean }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'PIN_ROW_TOP'; rowId: string }
  | { type: 'PIN_ROW_BOTTOM'; rowId: string }
  | { type: 'UNPIN_ROW'; rowId: string }
  | { type: 'SET_PAGE_INDEX'; pageIndex: number }
  | { type: 'SET_PAGE_SIZE'; pageSize: number }
  | { type: 'APPLY_VIEW'; state: LedgerGridState }
