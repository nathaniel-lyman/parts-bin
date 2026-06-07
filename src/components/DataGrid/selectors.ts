import type { LedgerGridColumn, LedgerGridState } from './types'

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

