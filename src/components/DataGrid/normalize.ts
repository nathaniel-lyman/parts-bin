import type { SortingState } from '@tanstack/react-table'
import type { ColumnPinning, DataGridState, GridColumnType } from './types'

export const ACTIONS_COLUMN_ID = 'actions'

export const DEFAULT_COLUMN_ORDER: string[] = []
export const MOVABLE_COLUMN_IDS: string[] = []

/** Minimal column shape needed to decide position-lock / action-render status. */
export interface LockableColumn {
  id: string
  type?: GridColumnType
  lockPosition?: 'last'
}

/**
 * A column whose position is locked to the end of the grid (forced last, pinned right, excluded
 * from sort/group, non-hideable, always visible). `lockPosition: 'last'` is the canonical opt-in;
 * `type: 'actions'` and the legacy `id === 'actions'` are kept as back-compat triggers.
 */
export function isLockPositionColumn(column: LockableColumn): boolean {
  return column.lockPosition === 'last' || column.type === 'actions' || column.id === ACTIONS_COLUMN_ID
}

/**
 * The non-data action column (compact padding, no copy/range/filter). Distinct from a plain
 * position lock — a `lockPosition: 'last'` *data* column still renders and behaves as a data cell.
 */
export function isActionRenderColumn(column: LockableColumn): boolean {
  return column.type === 'actions' || column.id === ACTIONS_COLUMN_ID
}

/** Ids of all position-locked columns, in the given column order. */
export function lockedColumnIds(columns: readonly LockableColumn[]): string[] {
  return columns.filter(isLockPositionColumn).map((column) => column.id)
}

/**
 * Treats `id` as position-locked. With an explicit set (derived from the live columns) any
 * `lockPosition` column participates; without one we fall back to the legacy `'actions'` id so
 * callers that only have column ids — or none at all — keep their historical behaviour.
 */
function isLockedId(id: string, lockedIds?: ReadonlySet<string>): boolean {
  return lockedIds ? lockedIds.has(id) : id === ACTIONS_COLUMN_ID
}

export const isMovableColumnId = (id: string) => id !== ACTIONS_COLUMN_ID

function canonicalOrder(columnIds?: readonly string[], lockedIds?: ReadonlySet<string>): string[] {
  if (!columnIds?.length) return [...DEFAULT_COLUMN_ORDER]

  const free: string[] = []
  const locked: string[] = []
  for (const id of columnIds) {
    if (isLockedId(id, lockedIds)) {
      if (!locked.includes(id)) locked.push(id)
    } else if (!free.includes(id)) {
      free.push(id)
    }
  }
  return [...free, ...locked]
}

export function normalizeColumnOrder(
  value: unknown,
  columnIds?: readonly string[],
  lockedIds?: ReadonlySet<string>,
): string[] {
  const canonical = canonicalOrder(columnIds, lockedIds)
  const known = columnIds?.length ? new Set(canonical) : undefined
  if (!Array.isArray(value)) return canonical

  // Locked ids known from columnIds (in canonical order), extended by any seen in `value`.
  const locked = canonical.filter((id) => isLockedId(id, lockedIds))
  const lockedSeen = new Set(locked)
  const free: string[] = []
  for (const id of value) {
    if (typeof id !== 'string') continue
    if (isLockedId(id, lockedIds)) {
      if (!lockedSeen.has(id) && (!known || known.has(id))) {
        lockedSeen.add(id)
        locked.push(id)
      }
      continue
    }
    if (!free.includes(id) && (!known || known.has(id))) free.push(id)
  }

  for (const id of canonical) {
    if (!isLockedId(id, lockedIds) && !free.includes(id)) free.push(id)
  }

  return [...free, ...locked]
}

export function normalizeColumnPinning(
  pinning: ColumnPinning,
  columnIds?: readonly string[],
  lockedIds?: ReadonlySet<string>,
): ColumnPinning {
  const known = columnIds?.length ? new Set(columnIds) : undefined
  const locked = (id: string) => isLockedId(id, lockedIds)
  const keep = (id: string) => !locked(id) && (!known || known.has(id))
  const left = pinning.left.filter(keep)
  const rightFree = pinning.right.filter(keep)
  // Locked columns are always pinned right: those known from columnIds (in order), else any seen
  // in the incoming pinning. De-duplicated.
  const lockedPresent = known
    ? [...known].filter(locked)
    : [...new Set([...pinning.left, ...pinning.right].filter(locked))]
  return { left, right: [...rightFree, ...lockedPresent] }
}

export const normalizePinning = normalizeColumnPinning

export const canHideColumn = (id: string) => id !== ACTIONS_COLUMN_ID
export const canSortColumn = (id: string) => id !== ACTIONS_COLUMN_ID
export const canReorderColumn = (id: string) => isMovableColumnId(id)
export const canExportColumn = (id: string) => id !== ACTIONS_COLUMN_ID

export function isLockedColumn(id: string): boolean {
  return id === ACTIONS_COLUMN_ID
}

export function normalizeSorting(sorting: SortingState, lockedIds?: ReadonlySet<string>): SortingState {
  return sorting.filter((item) => !isLockedId(item.id, lockedIds))
}

export function normalizeGrouping(
  value: unknown,
  columnIds?: readonly string[],
  lockedIds?: ReadonlySet<string>,
): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const grouping: string[] = []
  for (const id of value) {
    if (typeof id !== 'string' || isLockedId(id, lockedIds) || seen.has(id)) continue
    if (columnIds?.length && !columnIds.includes(id)) continue
    seen.add(id)
    grouping.push(id)
  }
  return grouping
}

export function normalizeNumberFormats(
  value: DataGridState['numberFormats'],
  columnIds?: readonly string[],
): DataGridState['numberFormats'] {
  if (!columnIds?.length) return value
  const known = new Set(columnIds)
  return Object.fromEntries(Object.entries(value).filter(([id]) => known.has(id)))
}

export function normalizeState(
  state: DataGridState,
  columnIds?: readonly string[],
  lockedIds?: ReadonlySet<string>,
): DataGridState {
  const columnOrder = normalizeColumnOrder(state.columnOrder, columnIds, lockedIds)
  const inferredColumnIds = columnIds?.length ? columnIds : columnOrder
  const columnPinning = normalizeColumnPinning(
    state.columnPinning,
    inferredColumnIds.length ? inferredColumnIds : undefined,
    lockedIds,
  )
  // Locked columns are forced visible. Resolve which locked ids are present from the column set
  // (or, with no columns, from whatever the pinning/visibility slices reference).
  const lockedPresent = inferredColumnIds.length
    ? inferredColumnIds.filter((id) => isLockedId(id, lockedIds))
    : [...new Set([...columnPinning.left, ...columnPinning.right, ...Object.keys(state.columnVisibility)])].filter(
        (id) => isLockedId(id, lockedIds),
      )
  let columnVisibility = state.columnVisibility
  for (const id of lockedPresent) {
    if (columnVisibility[id] === false) {
      columnVisibility = { ...columnVisibility, [id]: true }
    }
  }
  const grouping = normalizeGrouping(state.grouping, columnIds, lockedIds)
  const numberFormats = normalizeNumberFormats(state.numberFormats, columnIds)
  return { ...state, columnOrder, columnPinning, columnVisibility, grouping, numberFormats }
}
