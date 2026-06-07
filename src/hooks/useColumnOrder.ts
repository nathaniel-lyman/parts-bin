import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

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

export type ColumnOrder = string[]

const KEY = 'ledger.colOrder'
const knownColumnIds = new Set<string>(DEFAULT_COLUMN_ORDER)
const movableColumnIds = new Set<string>(MOVABLE_COLUMN_IDS)

export const isMovableColumnId = (id: string) => movableColumnIds.has(id)

export function normalizeColumnOrder(value: unknown): ColumnOrder {
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

function load(): ColumnOrder {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return [...DEFAULT_COLUMN_ORDER]
    return normalizeColumnOrder(JSON.parse(raw))
  } catch {
    return [...DEFAULT_COLUMN_ORDER]
  }
}

export function useColumnOrder(): {
  columnOrder: ColumnOrder
  setColumnOrder: Dispatch<SetStateAction<ColumnOrder>>
  reset: () => void
} {
  const [columnOrder, setColumnOrder] = useState<ColumnOrder>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(columnOrder))
  }, [columnOrder])

  const reset = useCallback(() => setColumnOrder([...DEFAULT_COLUMN_ORDER]), [])

  return { columnOrder, setColumnOrder, reset }
}
