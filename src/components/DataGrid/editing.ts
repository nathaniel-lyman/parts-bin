import { resolveColumnValue } from './aggregation'
import type { LedgerGridColumn } from './types'

export type EditorType = 'text' | 'number' | 'select' | 'date'

export type EditMode = 'cell' | 'row'

/**
 * One in-flight edit. `drafts` holds the raw editor strings keyed by column id —
 * cell mode has exactly one entry, row mode one per editable column.
 */
export interface EditSession {
  mode: EditMode
  rowId: string
  columnId: string
  drafts: Record<string, string>
  errors: Record<string, string>
}

/** Cells committed-changed this browser session: rowId -> columnId -> true. */
export type DirtyCells = Record<string, Record<string, true>>

export function isColumnEditable<TData>(column: LedgerGridColumn<TData> | undefined): boolean {
  return Boolean(column && column.editable && column.accessorKey && column.type !== 'actions')
}

export function editorTypeFor<TData>(column: LedgerGridColumn<TData>): EditorType {
  if (column.meta?.options?.length) return 'select'
  switch (column.type) {
    case 'number':
    case 'currency':
    case 'percent':
      return 'number'
    case 'date':
      return 'date'
    default:
      return 'text'
  }
}

export function toDraftValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function startEdit<TData>(
  mode: EditMode,
  rowId: string,
  columnId: string,
  columns: LedgerGridColumn<TData>[],
  row: TData,
): EditSession {
  const editable = mode === 'row'
    ? columns.filter((column) => isColumnEditable(column))
    : columns.filter((column) => column.id === columnId && isColumnEditable(column))
  const drafts: Record<string, string> = {}
  for (const column of editable) {
    drafts[column.id] = toDraftValue(resolveColumnValue(column, row))
  }
  return { mode, rowId, columnId, drafts, errors: {} }
}

export function setDraft(session: EditSession, columnId: string, value: string): EditSession {
  const errors = { ...session.errors }
  delete errors[columnId]
  return { ...session, drafts: { ...session.drafts, [columnId]: value }, errors }
}

export interface ParseResult {
  value: unknown
  error?: string
}

export function parseDraft(type: EditorType, draft: string): ParseResult {
  if (type !== 'number') return { value: draft }
  if (draft.trim() === '') return { value: null, error: 'Enter a number' }
  // Tolerate formatted numerics ("$24,600", "-2.1%") so a formatted clipboard copy pastes back into
  // number cells and editors accept what they display. Strips currency/grouping/percent symbols only.
  const num = Number(draft.replace(/[$,%]/g, ''))
  if (!Number.isFinite(num)) return { value: null, error: 'Enter a number' }
  return { value: num }
}

export interface CommitResult {
  ok: boolean
  /** accessorKey -> parsed value, only for columns whose value actually changed */
  patch: Record<string, unknown>
  /** columnId -> message */
  errors: Record<string, string>
  /** column ids whose value changed (for dirty markers) */
  changed: string[]
}

export function commitSession<TData>(
  session: EditSession,
  columns: LedgerGridColumn<TData>[],
  row: TData,
): CommitResult {
  const patch: Record<string, unknown> = {}
  const errors: Record<string, string> = {}
  const changed: string[] = []

  for (const [columnId, draft] of Object.entries(session.drafts)) {
    const column = columns.find((item) => item.id === columnId)
    if (!column || !isColumnEditable(column)) continue
    const parsed = parseDraft(editorTypeFor(column), draft)
    if (parsed.error) {
      errors[columnId] = parsed.error
      continue
    }
    const message = column.validate?.(parsed.value as never, row)
    if (message) {
      errors[columnId] = message
      continue
    }
    const current = resolveColumnValue(column, row)
    if (parsed.value === current) continue
    patch[column.accessorKey as string] = parsed.value
    changed.push(columnId)
  }

  return { ok: Object.keys(errors).length === 0, patch, errors, changed }
}

export function markDirty(dirty: DirtyCells, rowId: string, columnIds: string[]): DirtyCells {
  if (columnIds.length === 0) return dirty
  const rowDirty = { ...(dirty[rowId] ?? {}) }
  for (const id of columnIds) rowDirty[id] = true
  return { ...dirty, [rowId]: rowDirty }
}

export function isDirtyCell(dirty: DirtyCells, rowId: string, columnId: string): boolean {
  return dirty[rowId]?.[columnId] === true
}

/** Grid-level editing surface threaded down to rows/cells (built by DataGrid). */
export interface GridEditingApi {
  session: EditSession | null
  isEditable: (columnId: string) => boolean
  isDirty: (rowId: string, columnId: string) => boolean
  editorFor: (columnId: string) => { type: EditorType; options?: string[] }
  start: (rowId: string, columnId: string) => void
  setDraft: (columnId: string, value: string) => void
  commit: (move?: 'next' | 'prev') => void
  cancel: () => void
}

/** True when this specific cell should render an editor for the given session. */
export function isEditingCell(
  session: EditSession | null,
  rowId: string,
  columnId: string,
  isEditable: (columnId: string) => boolean,
): boolean {
  if (!session || session.rowId !== rowId) return false
  if (session.mode === 'cell') return session.columnId === columnId
  return isEditable(columnId)
}
