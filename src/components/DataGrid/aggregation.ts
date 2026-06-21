import type { AggregateKind, AggregateSpec, GridColumnType, LedgerGridColumn } from './types'

/** Numeric values only — non-numeric rows are skipped, not coerced to 0. */
function numericValues(values: unknown[]): number[] {
  const out: number[] = []
  for (const value of values) {
    const num = typeof value === 'number' ? value : Number(value)
    if (typeof value !== 'boolean' && value !== '' && value != null && Number.isFinite(num)) out.push(num)
  }
  return out
}

export function aggregate(kind: AggregateKind, values: unknown[]): number | null {
  if (kind === 'count') return values.length
  const nums = numericValues(values)
  if (nums.length === 0) return null
  switch (kind) {
    case 'sum':
      return nums.reduce((acc, value) => acc + value, 0)
    case 'avg':
      return nums.reduce((acc, value) => acc + value, 0) / nums.length
    case 'min':
      return Math.min(...nums)
    case 'max':
      return Math.max(...nums)
  }
}

const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

export function formatAggregate(value: number | null, type?: GridColumnType): string {
  if (value === null) return '—'
  switch (type) {
    case 'currency':
      return `$${wholeNumber.format(value)}`
    case 'percent':
      return `${oneDecimal.format(value)}%`
    default:
      return Number.isInteger(value) ? wholeNumber.format(value) : oneDecimal.format(value)
  }
}

export const AGGREGATE_LABELS: Record<AggregateKind, string> = {
  sum: 'Σ',
  avg: 'avg',
  min: 'min',
  max: 'max',
  count: '#',
}

export function resolveAggregate<TData>(
  column: LedgerGridColumn<TData>,
  rows: TData[],
): number | null {
  if (!column.aggregate) return null
  const values = rows.map((row) => resolveColumnValue(column, row))
  if (typeof column.aggregate === 'function') {
    return column.aggregate({ values, rows, column })
  }
  return aggregate(column.aggregate, values)
}

export function aggregateLabel<TData>(aggregateSpec: AggregateSpec<TData>): string {
  return typeof aggregateSpec === 'function' ? 'fx' : AGGREGATE_LABELS[aggregateSpec]
}

export function resolveColumnValue<TData>(column: LedgerGridColumn<TData>, row: TData): unknown {
  if (column.accessorFn) return column.accessorFn(row)
  if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey as string]
  return undefined
}

export interface ColumnAggregate {
  columnId: string
  kind: AggregateKind | 'custom'
  label: string
  value: number | null
  formatted: string
}

/** Footer totals: one entry per column that declares an `aggregate`, over the given rows. */
export function computeAggregates<TData>(
  columns: LedgerGridColumn<TData>[],
  rows: TData[],
): Record<string, ColumnAggregate> {
  const result: Record<string, ColumnAggregate> = {}
  for (const column of columns) {
    if (!column.aggregate) continue
    const value = resolveAggregate(column, rows)
    result[column.id] = {
      columnId: column.id,
      kind: typeof column.aggregate === 'function' ? 'custom' : column.aggregate,
      label: aggregateLabel(column.aggregate),
      value,
      formatted: formatAggregate(value, column.type),
    }
  }
  return result
}
