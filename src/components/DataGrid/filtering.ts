import type { Cell, Row } from '@tanstack/react-table'

export const FILTER_COLUMN_TYPES = ['text', 'number', 'currency', 'percent', 'date', 'status', 'enum'] as const
export type FilterColumnType = (typeof FILTER_COLUMN_TYPES)[number]

export interface GridColumnFilterMeta {
  type: FilterColumnType
  options?: string[]
}

const NUMERIC_OPS = ['equals', 'greaterThan', 'lessThan', 'between'] as const

export const FILTER_OPERATORS = {
  text: ['contains', 'equals', 'startsWith', 'isEmpty'],
  number: NUMERIC_OPS,
  currency: NUMERIC_OPS,
  percent: NUMERIC_OPS,
  date: ['before', 'after', 'between'],
  status: ['is', 'isAnyOf'],
  enum: ['is', 'isAnyOf'],
} as const satisfies Record<FilterColumnType, readonly string[]>

export type FilterOperator = (typeof FILTER_OPERATORS)[FilterColumnType][number]

export interface FilterValue {
  operator: FilterOperator
  value: unknown
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

export function makeFilterFn(type: FilterColumnType, operator: string, value: unknown): (cellValue: unknown) => boolean {
  switch (type) {
    case 'text': {
      const needle = String(value ?? '').toLowerCase()
      switch (operator) {
        case 'contains':
          return (cellValue) => String(cellValue ?? '').toLowerCase().includes(needle)
        case 'equals':
          return (cellValue) => String(cellValue ?? '').toLowerCase() === needle
        case 'startsWith':
          return (cellValue) => String(cellValue ?? '').toLowerCase().startsWith(needle)
        case 'isEmpty':
          return (cellValue) => isBlank(cellValue)
        default:
          return () => true
      }
    }
    case 'number':
    case 'currency':
    case 'percent': {
      switch (operator) {
        case 'equals': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current === target
          }
        }
        case 'greaterThan': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current > target
          }
        }
        case 'lessThan': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current < target
          }
        }
        case 'between': {
          const [lo, hi] = Array.isArray(value) ? value : [undefined, undefined]
          const min = toNumber(lo)
          const max = toNumber(hi)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && (min === null || current >= min) && (max === null || current <= max)
          }
        }
        default:
          return () => true
      }
    }
    case 'date': {
      switch (operator) {
        case 'before':
          return (cellValue) => String(cellValue ?? '') !== '' && String(cellValue) < String(value)
        case 'after':
          return (cellValue) => String(cellValue ?? '') !== '' && String(cellValue) > String(value)
        case 'between': {
          const [lo, hi] = Array.isArray(value) ? value : [undefined, undefined]
          return (cellValue) => {
            const current = String(cellValue ?? '')
            const min = lo == null || lo === '' ? null : String(lo)
            const max = hi == null || hi === '' ? null : String(hi)
            return current !== '' && (min === null || current >= min) && (max === null || current <= max)
          }
        }
        default:
          return () => true
      }
    }
    case 'status':
    case 'enum': {
      switch (operator) {
        case 'is':
          return (cellValue) => String(cellValue) === String(value)
        case 'isAnyOf': {
          const set = Array.isArray(value) ? value.map(String) : []
          return (cellValue) => set.length === 0 || set.includes(String(cellValue))
        }
        default:
          return () => true
      }
    }
    default:
      return () => true
  }
}

/**
 * Schema-agnostic column filter. Operates structurally on `cell.getValue()`, so
 * it works for any row shape — no dependency on the demo `Account` type.
 */
export function ledgerFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: FilterValue,
): boolean {
  if (!filterValue || typeof filterValue !== 'object') return true
  const cell = row.getAllCells().find((candidate: Cell<TData, unknown>) => candidate.column.id === columnId)
  if (!cell) return true
  const colType = cell.column.columnDef.meta?.type ?? 'text'
  return makeFilterFn(colType, filterValue.operator, filterValue.value)(cell.getValue())
}
