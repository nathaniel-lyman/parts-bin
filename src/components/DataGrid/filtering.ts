import type { Cell, Row } from '@tanstack/react-table'

export const FILTER_COLUMN_TYPES = ['text', 'number', 'currency', 'percent', 'date', 'status', 'enum'] as const
export type FilterColumnType = (typeof FILTER_COLUMN_TYPES)[number]

export interface GridColumnFilterMeta {
  type: FilterColumnType
  options?: string[]
}

const NUMERIC_OPS = ['equals', 'notEquals', 'greaterThan', 'gte', 'lessThan', 'lte', 'between', 'blank', 'notBlank'] as const

export const FILTER_OPERATORS = {
  text: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith', 'endsWith', 'blank', 'notBlank'],
  number: NUMERIC_OPS,
  currency: NUMERIC_OPS,
  percent: NUMERIC_OPS,
  date: ['before', 'after', 'between', 'blank', 'notBlank'],
  status: ['is', 'isAnyOf'],
  enum: ['is', 'isAnyOf'],
} as const satisfies Record<FilterColumnType, readonly string[]>

/** Operators that need no value — the menu/floating filter hide the value input for these. */
export const VALUELESS_OPERATORS = new Set(['blank', 'notBlank', 'isEmpty'])

export type FilterOperator = (typeof FILTER_OPERATORS)[FilterColumnType][number]

export interface FilterCondition {
  operator: FilterOperator
  value: unknown
}

export interface FilterValue extends FilterCondition {
  /** Optional second condition joined to the first by `conjunction` (defaults to 'and'). The base
   *  `{ operator, value }` is condition 1, so a single-condition filter stays shape-compatible. */
  conjunction?: 'and' | 'or'
  condition2?: FilterCondition
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

/**
 * Parse a date-ish value to a comparable timestamp. Date filters previously compared the raw strings
 * lexically, which only happens to work when cell + filter share an ISO `YYYY-MM-DD` shape — it
 * silently misorders US `MM/DD/YYYY`, mixed formats, or `Date` objects. Parsing both sides to a
 * timestamp compares them chronologically; an unparseable/blank value yields null and is excluded.
 */
function toTimestamp(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime()
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const ts = Date.parse(String(value))
  return Number.isNaN(ts) ? null : ts
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

export function makeFilterFn(type: FilterColumnType, operator: string, value: unknown): (cellValue: unknown) => boolean {
  // isAnyOf is the set-filter predicate and is type-agnostic: keep a row when its stringified value
  // is one of the selected values. An empty set matches everything (no constraint).
  if (operator === 'isAnyOf') {
    const set = new Set(Array.isArray(value) ? value.map(String) : [])
    return (cellValue) => set.size === 0 || set.has(String(cellValue))
  }
  switch (type) {
    case 'text': {
      const needle = String(value ?? '').toLowerCase()
      switch (operator) {
        case 'contains':
          return (cellValue) => String(cellValue ?? '').toLowerCase().includes(needle)
        case 'notContains':
          return (cellValue) => !String(cellValue ?? '').toLowerCase().includes(needle)
        case 'equals':
          return (cellValue) => String(cellValue ?? '').toLowerCase() === needle
        case 'notEquals':
          return (cellValue) => String(cellValue ?? '').toLowerCase() !== needle
        case 'startsWith':
          return (cellValue) => String(cellValue ?? '').toLowerCase().startsWith(needle)
        case 'endsWith':
          return (cellValue) => String(cellValue ?? '').toLowerCase().endsWith(needle)
        case 'blank':
        case 'isEmpty':
          return (cellValue) => isBlank(cellValue)
        case 'notBlank':
          return (cellValue) => !isBlank(cellValue)
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
        case 'notEquals': {
          const target = toNumber(value)
          // A blank/non-numeric cell is "not equal" to the target number, matching AG Grid.
          return (cellValue) => {
            const current = toNumber(cellValue)
            return target === null ? true : current !== target
          }
        }
        case 'greaterThan': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current > target
          }
        }
        case 'gte': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current >= target
          }
        }
        case 'lessThan': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current < target
          }
        }
        case 'lte': {
          const target = toNumber(value)
          return (cellValue) => {
            const current = toNumber(cellValue)
            return current !== null && target !== null && current <= target
          }
        }
        case 'blank':
          return (cellValue) => isBlank(cellValue)
        case 'notBlank':
          return (cellValue) => !isBlank(cellValue)
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
        case 'before': {
          const target = toTimestamp(value)
          return (cellValue) => {
            const current = toTimestamp(cellValue)
            return current !== null && target !== null && current < target
          }
        }
        case 'after': {
          const target = toTimestamp(value)
          return (cellValue) => {
            const current = toTimestamp(cellValue)
            return current !== null && target !== null && current > target
          }
        }
        case 'between': {
          const [lo, hi] = Array.isArray(value) ? value : [undefined, undefined]
          const min = toTimestamp(lo)
          const max = toTimestamp(hi)
          return (cellValue) => {
            const current = toTimestamp(cellValue)
            return current !== null && (min === null || current >= min) && (max === null || current <= max)
          }
        }
        case 'blank':
          return (cellValue) => isBlank(cellValue)
        case 'notBlank':
          return (cellValue) => !isBlank(cellValue)
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
  const cellValue = cell.getValue()
  const first = makeFilterFn(colType, filterValue.operator, filterValue.value)(cellValue)
  if (!filterValue.condition2) return first
  const second = makeFilterFn(colType, filterValue.condition2.operator, filterValue.condition2.value)(cellValue)
  return filterValue.conjunction === 'or' ? first || second : first && second
}
