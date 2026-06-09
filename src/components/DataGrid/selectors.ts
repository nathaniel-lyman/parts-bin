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

/** Row height (px) per density — must track the `--row-h-*` tokens in tokens.css. */
export const ROW_HEIGHTS: Record<Density, number> = {
  compact: 40,
  standard: 48,
  comfortable: 56,
}

export function rowHeightForDensity(density: Density): number {
  return ROW_HEIGHTS[density] ?? ROW_HEIGHTS.compact
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

export interface PinnedOffsets {
  left: Record<string, number>
  right: Record<string, number>
}

/**
 * Cumulative sticky offsets (px) for pinned columns so multiple columns pinned to the same
 * side stack edge-to-edge instead of all collapsing to `left: 0` / `right: 0`.
 * `leadingOffset` reserves space for a sticky leading column (e.g. the selection checkbox).
 */
export function pinnedOffsets(
  groups: { left: string[]; right: string[] },
  widths: Record<string, number>,
  leadingOffset = 0,
): PinnedOffsets {
  const left: Record<string, number> = {}
  let leftAcc = leadingOffset
  for (const id of groups.left) {
    left[id] = leftAcc
    leftAcc += widths[id] ?? 0
  }

  const right: Record<string, number> = {}
  let rightAcc = 0
  for (let index = groups.right.length - 1; index >= 0; index -= 1) {
    const id = groups.right[index]
    right[id] = rightAcc
    rightAcc += widths[id] ?? 0
  }

  return { left, right }
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
