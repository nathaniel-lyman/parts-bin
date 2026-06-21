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

export type AggregateKind = 'sum' | 'avg' | 'min' | 'max' | 'count'

export type DataGridNumberFormatStyle = 'number' | 'currency' | 'percent'
export type DataGridNumberFormatNotation = 'standard' | 'compact'
export type DataGridNumberFormatSignDisplay = 'auto' | 'always' | 'exceptZero' | 'never'
export type DataGridCurrencySign = 'standard' | 'accounting'

export interface DataGridNumberFormat {
  style?: DataGridNumberFormatStyle
  currency?: string
  currencySign?: DataGridCurrencySign
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  notation?: DataGridNumberFormatNotation
  signDisplay?: DataGridNumberFormatSignDisplay
  useGrouping?: boolean
  /**
   * Multiplier applied before formatting. Percent columns default to 0.01 so stored values like
   * `5` render as `5.0%`; set `scale: 1` when row values are already decimal ratios.
   */
  scale?: number
}

export interface AggregateContext<TData> {
  values: unknown[]
  rows: TData[]
  column: DataGridColumn<TData>
}

export type AggregateFn<TData> = (context: AggregateContext<TData>) => number | null
export type AggregateSpec<TData> = AggregateKind | AggregateFn<TData>

export type GridExpandedState = true | Record<string, boolean>

export interface DataGridCellContext<TData, TValue = unknown> {
  value: TValue
  formattedValue: string
  formatValue: (format?: DataGridNumberFormat) => string
  row: TData
  rowId: string
}

export interface DataGridColumn<TData, TValue = unknown> {
  id: string
  accessorKey?: keyof TData
  accessorFn?: (row: TData) => TValue
  header: string | ReactNode
  cell?: (ctx: DataGridCellContext<TData, TValue>) => ReactNode
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
  /**
   * Locks the column to the end of the grid: forced last in order, pinned right, excluded from
   * sort/group, non-hideable, and always visible. The domain-neutral way to get the old "actions
   * column" position lock without naming a column `actions` (`type: 'actions'` still implies it).
   */
  lockPosition?: 'last'
  numberFormat?: DataGridNumberFormat
  sortable?: boolean
  /** Custom sort order for non-blank values (ascending); blanks always sort last regardless. */
  comparator?: (a: TData, b: TData) => number
  filterable?: boolean
  resizable?: boolean
  reorderable?: boolean
  pinnable?: boolean
  hideable?: boolean
  exportable?: boolean
  /**
   * Formats the cell value for clipboard copy (Ctrl/Cmd+C of a range, row, selection, or cell).
   * Lets a copied currency/percent column land in Excel as "$24,600" / "-2.1%" instead of the raw
   * accessor value. Defaults to the raw value when omitted. Not applied to CSV/XLSX file exports.
   */
  exportValue?: (value: TValue, row: TData) => string | number | null | undefined
  /** Opt-in: the column can be edited inline. Requires `accessorKey` so commits can patch the row. */
  editable?: boolean
  /** Returns an error message to block the commit, or null/undefined to accept. */
  validate?: (value: TValue, row: TData) => string | null | undefined
  /** Opt-in: the column appears in "Group by" menus and grouping chips. */
  groupable?: boolean
  /** Aggregate shown in group summary rows and the totals footer. */
  aggregate?: AggregateSpec<TData>
  /** Custom renderer for aggregated values; defaults to type-aware formatting. */
  aggregatedCell?: (ctx: { value: unknown }) => ReactNode
}

export interface DataGridState {
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
  grouping: string[]
  expanded: GridExpandedState
  numberFormats: Record<string, DataGridNumberFormat>
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
  | { type: 'SET_GROUPING'; grouping: string[] }
  | { type: 'TOGGLE_GROUP_BY'; columnId: string }
  | { type: 'CLEAR_GROUPING' }
  | { type: 'SET_COLUMN_NUMBER_FORMAT'; columnId: string; format: DataGridNumberFormat }
  | { type: 'CLEAR_COLUMN_NUMBER_FORMAT'; columnId: string }
  | { type: 'EXPAND_ALL' }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'SET_EXPANDED'; expanded: GridExpandedState }
  | { type: 'APPLY_VIEW'; state: DataGridState }
