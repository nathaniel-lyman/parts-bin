import type { ColumnPinning, Density, LedgerGridColumn, LedgerGridState } from './types'

export function orderedColumns<TData>(
  columns: LedgerGridColumn<TData>[],
  state: LedgerGridState,
): LedgerGridColumn<TData>[] {
  const byId = new Map(columns.map((column) => [column.id, column]))
  const ordered: LedgerGridColumn<TData>[] = []
  const seen = new Set<string>()

  for (const id of state.columnOrder) {
    const column = byId.get(id)
    if (column) {
      ordered.push(column)
      seen.add(id)
    }
  }

  for (const column of columns) {
    if (!seen.has(column.id)) ordered.push(column)
  }

  return ordered
}

export function visibleColumns<TData>(
  columns: LedgerGridColumn<TData>[],
  state: LedgerGridState,
): LedgerGridColumn<TData>[] {
  return orderedColumns(columns, state).filter((column) => state.columnVisibility[column.id] !== false)
}

export function densityClass(density: Density): string {
  return `density-${density}`
}

export interface PinnedLeafGroups {
  left: string[]
  center: string[]
  right: string[]
}

export function pinnedLeafGroups(orderedVisibleIds: string[], pinning: ColumnPinning): PinnedLeafGroups {
  const visible = new Set(orderedVisibleIds)
  const left = pinning.left.filter((id) => visible.has(id))
  const right = pinning.right.filter((id) => visible.has(id))
  const pinned = new Set([...left, ...right])
  const center = orderedVisibleIds.filter((id) => !pinned.has(id))
  return { left, center, right }
}

export function selectionCount(rowSelection: LedgerGridState['rowSelection']): number {
  return Object.keys(rowSelection).length
}

export function selectAllState(
  rowSelection: LedgerGridState['rowSelection'],
  visibleIds: string[],
): 'none' | 'some' | 'all' {
  if (visibleIds.length === 0) return 'none'
  let selected = 0
  for (const id of visibleIds) if (rowSelection[id]) selected++
  if (selected === 0) return 'none'
  if (selected === visibleIds.length) return 'all'
  return 'some'
}
