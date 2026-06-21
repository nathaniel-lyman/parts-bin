import type { SortingState } from '@tanstack/react-table'
import type { ColumnPinning, LedgerGridState } from './types'

export const ACTIONS_COLUMN_ID = 'actions'

export const DEFAULT_COLUMN_ORDER: string[] = []
export const MOVABLE_COLUMN_IDS: string[] = []

export const isMovableColumnId = (id: string) => id !== ACTIONS_COLUMN_ID

function canonicalOrder(columnIds?: readonly string[]): string[] {
  if (!columnIds?.length) return [...DEFAULT_COLUMN_ORDER]

  const ordered: string[] = []
  for (const id of columnIds) {
    if (id !== ACTIONS_COLUMN_ID && !ordered.includes(id)) ordered.push(id)
  }
  return columnIds.includes(ACTIONS_COLUMN_ID) ? [...ordered, ACTIONS_COLUMN_ID] : ordered
}

export function normalizeColumnOrder(value: unknown, columnIds?: readonly string[]): string[] {
  const canonical = canonicalOrder(columnIds)
  const known = columnIds?.length ? new Set(canonical) : undefined
  if (!Array.isArray(value)) return canonical

  const ordered: string[] = []
  let hasActions = columnIds?.includes(ACTIONS_COLUMN_ID) ?? false
  for (const id of value) {
    if (id === ACTIONS_COLUMN_ID) {
      hasActions = true
      continue
    }
    if (typeof id === 'string' && id !== ACTIONS_COLUMN_ID && !ordered.includes(id) && (!known || known.has(id))) {
      ordered.push(id)
    }
  }

  for (const id of canonical) {
    if (id !== ACTIONS_COLUMN_ID && !ordered.includes(id)) ordered.push(id)
  }

  return hasActions ? [...ordered, ACTIONS_COLUMN_ID] : ordered
}

export function normalizeColumnPinning(pinning: ColumnPinning, columnIds?: readonly string[]): ColumnPinning {
  const known = columnIds?.length ? new Set(columnIds) : undefined
  const keep = (id: string) => id !== ACTIONS_COLUMN_ID && (!known || known.has(id))
  const left = pinning.left.filter(keep)
  const rightWithoutActions = pinning.right.filter(keep)
  const hasActions = known ? known.has(ACTIONS_COLUMN_ID) : [...pinning.left, ...pinning.right].includes(ACTIONS_COLUMN_ID)
  return { left, right: hasActions ? [...rightWithoutActions, ACTIONS_COLUMN_ID] : rightWithoutActions }
}

export const normalizePinning = normalizeColumnPinning

export const canHideColumn = (id: string) => id !== ACTIONS_COLUMN_ID
export const canSortColumn = (id: string) => id !== ACTIONS_COLUMN_ID
export const canReorderColumn = (id: string) => isMovableColumnId(id)
export const canExportColumn = (id: string) => id !== ACTIONS_COLUMN_ID

export function isLockedColumn(id: string): boolean {
  return id === ACTIONS_COLUMN_ID
}

export function normalizeSorting(sorting: SortingState): SortingState {
  return sorting.filter((item) => !isLockedColumn(item.id))
}

export function normalizeGrouping(value: unknown, columnIds?: readonly string[]): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const grouping: string[] = []
  for (const id of value) {
    if (typeof id !== 'string' || id === ACTIONS_COLUMN_ID || seen.has(id)) continue
    if (columnIds?.length && !columnIds.includes(id)) continue
    seen.add(id)
    grouping.push(id)
  }
  return grouping
}

export function normalizeNumberFormats(
  value: LedgerGridState['numberFormats'],
  columnIds?: readonly string[],
): LedgerGridState['numberFormats'] {
  if (!columnIds?.length) return value
  const known = new Set(columnIds)
  return Object.fromEntries(Object.entries(value).filter(([id]) => known.has(id)))
}

export function normalizeState(state: LedgerGridState, columnIds?: readonly string[]): LedgerGridState {
  const columnOrder = normalizeColumnOrder(state.columnOrder, columnIds)
  const inferredColumnIds = columnIds?.length ? columnIds : columnOrder
  const columnPinning = normalizeColumnPinning(
    state.columnPinning,
    inferredColumnIds.length ? inferredColumnIds : undefined,
  )
  const hasActions = inferredColumnIds.length
    ? inferredColumnIds.includes(ACTIONS_COLUMN_ID)
    : columnPinning.right.includes(ACTIONS_COLUMN_ID) || ACTIONS_COLUMN_ID in state.columnVisibility
  const columnVisibility =
    hasActions && state.columnVisibility[ACTIONS_COLUMN_ID] === false
      ? { ...state.columnVisibility, [ACTIONS_COLUMN_ID]: true }
      : state.columnVisibility
  const grouping = normalizeGrouping(state.grouping, columnIds)
  const numberFormats = normalizeNumberFormats(state.numberFormats, columnIds)
  return { ...state, columnOrder, columnPinning, columnVisibility, grouping, numberFormats }
}
