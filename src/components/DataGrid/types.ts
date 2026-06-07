import type { ReactNode } from 'react'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'

export const DENSITIES = ['compact', 'standard', 'comfortable'] as const
export type Density = (typeof DENSITIES)[number]

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
  columnPinning: { left: string[]; right: string[] }
  rowSelection: Record<string, boolean>
  rowPinning: { top: string[]; bottom: string[] }
  pagination: { pageIndex: number; pageSize: number }
  density: Density
}

export type GridStatus = 'idle' | 'loading' | 'error'

export interface GridRuntimeStatus {
  status: GridStatus
  error?: unknown
}

export type GridAction =
  | { type: 'setSorting'; sorting: SortingState }
  | { type: 'setGlobalFilter'; globalFilter: string }
  | { type: 'setColumnVisibility'; columnVisibility: Record<string, boolean> }
  | { type: 'setColumnOrder'; columnOrder: string[] }

