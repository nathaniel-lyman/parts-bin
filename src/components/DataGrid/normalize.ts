import type { LedgerGridState } from './types'

export const ACTIONS_COLUMN_ID = 'actions'

export const DEFAULT_COLUMN_ORDER = [
  'account',
  'owner',
  'segment',
  'mrr',
  'growth',
  'status',
  'arr',
  'since',
  ACTIONS_COLUMN_ID,
] as const

export const MOVABLE_COLUMN_IDS = DEFAULT_COLUMN_ORDER.filter((id) => id !== ACTIONS_COLUMN_ID)

const knownColumnIds = new Set<string>(DEFAULT_COLUMN_ORDER)
const movableColumnIds = new Set<string>(MOVABLE_COLUMN_IDS)

export const isMovableColumnId = (id: string) => movableColumnIds.has(id)

export function normalizeColumnOrder(value: unknown): string[] {
  if (!Array.isArray(value)) return [...DEFAULT_COLUMN_ORDER]

  const ordered: string[] = []
  for (const id of value) {
    if (typeof id === 'string' && knownColumnIds.has(id) && id !== ACTIONS_COLUMN_ID && !ordered.includes(id)) {
      ordered.push(id)
    }
  }

  for (const id of DEFAULT_COLUMN_ORDER) {
    if (id !== ACTIONS_COLUMN_ID && !ordered.includes(id)) ordered.push(id)
  }

  return [...ordered, ACTIONS_COLUMN_ID]
}

export function normalizeColumnPinning(pinning: { left: string[]; right: string[] }): {
  left: string[]
  right: string[]
} {
  const left = pinning.left.filter((id) => id !== ACTIONS_COLUMN_ID)
  const rightWithoutActions = pinning.right.filter((id) => id !== ACTIONS_COLUMN_ID)
  return { left, right: [...rightWithoutActions, ACTIONS_COLUMN_ID] }
}

export const canHideColumn = (id: string) => id !== ACTIONS_COLUMN_ID
export const canSortColumn = (id: string) => id !== ACTIONS_COLUMN_ID
export const canReorderColumn = (id: string) => isMovableColumnId(id)
export const canExportColumn = (id: string) => id !== ACTIONS_COLUMN_ID

export function normalizeState(state: LedgerGridState): LedgerGridState {
  const columnOrder = normalizeColumnOrder(state.columnOrder)
  const columnPinning = normalizeColumnPinning(state.columnPinning)
  const columnVisibility =
    state.columnVisibility[ACTIONS_COLUMN_ID] === false
      ? { ...state.columnVisibility, [ACTIONS_COLUMN_ID]: true }
      : state.columnVisibility
  return { ...state, columnOrder, columnPinning, columnVisibility }
}

