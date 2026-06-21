import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import {
  commitSession,
  editorTypeFor,
  isColumnEditable,
  isDirtyCell,
  markDirty,
  setDraft,
  startEdit,
  type DirtyCells,
  type EditMode,
  type EditSession,
  type GridEditingApi,
} from './editing'
import type { GridFocus } from './keyboard'
import type { DataGridColumn } from './types'

export interface UseInlineEditingArgs<TData> {
  rows: TData[]
  columns: DataGridColumn<TData>[]
  columnsById: Map<string, DataGridColumn<TData>>
  getRowId: (row: TData) => string
  editMode: EditMode
  editingEnabled: boolean
  onRowUpdate?: (rowId: string, patch: Partial<TData>, row: TData) => void
  /** Visible column ids in render order — drives Tab/Shift+Tab cell-to-cell edit movement. */
  visibleColumnIds: string[]
  setFocus: Dispatch<SetStateAction<GridFocus>>
  refocusActiveCell: () => void
}

export interface UseInlineEditingResult {
  /** The editing API handed to cells, or undefined when editing is disabled. */
  editingApi: GridEditingApi | undefined
  /** Marks cells dirty outside the commit path (e.g. paste). No-op-safe when editing is off. */
  markDirtyCells: (rowId: string, columnIds: string[]) => void
}

/**
 * Owns inline-edit session state (the open editor, draft values, validation errors) and the
 * dirty-cell set, and exposes the {@link GridEditingApi} consumed by cells. Commit drives the
 * onRowUpdate patch, optional Tab/Shift+Tab movement to the next editable cell, and focus
 * restoration. Extracted from the DataGrid orchestrator; behaviour is identical.
 */
export function useInlineEditing<TData>({
  rows,
  columns,
  columnsById,
  getRowId,
  editMode,
  editingEnabled,
  onRowUpdate,
  visibleColumnIds,
  setFocus,
  refocusActiveCell,
}: UseInlineEditingArgs<TData>): UseInlineEditingResult {
  const [editSession, setEditSession] = useState<EditSession | null>(null)
  const [dirtyCells, setDirtyCells] = useState<DirtyCells>({})

  const markDirtyCells = useCallback((rowId: string, columnIds: string[]) => {
    setDirtyCells((current) => markDirty(current, rowId, columnIds))
  }, [])

  const startEditing = useCallback(
    (rowId: string, columnId: string) => {
      const row = rows.find((item) => getRowId(item) === rowId)
      if (!row || !isColumnEditable(columnsById.get(columnId))) return
      setEditSession(startEdit(editMode, rowId, columnId, columns, row))
    },
    [columns, columnsById, editMode, getRowId, rows],
  )

  const cancelEditing = useCallback(() => {
    setEditSession(null)
    refocusActiveCell()
  }, [refocusActiveCell])

  const commitEditing = useCallback(
    (move?: 'next' | 'prev') => {
      if (!editSession) return
      const row = rows.find((item) => getRowId(item) === editSession.rowId)
      if (!row) {
        setEditSession(null)
        return
      }
      const result = commitSession(editSession, columns, row)
      if (!result.ok) {
        setEditSession({ ...editSession, errors: result.errors })
        return
      }
      if (Object.keys(result.patch).length > 0) {
        onRowUpdate?.(editSession.rowId, result.patch as Partial<TData>, row)
        setDirtyCells((current) => markDirty(current, editSession.rowId, result.changed))
      }
      if (move && editSession.mode === 'cell') {
        const step = move === 'next' ? 1 : -1
        const from = visibleColumnIds.indexOf(editSession.columnId)
        for (let index = from + step; index >= 0 && index < visibleColumnIds.length; index += step) {
          if (isColumnEditable(columnsById.get(visibleColumnIds[index]))) {
            setFocus((current) => ({ ...current, col: index }))
            setEditSession(startEdit('cell', editSession.rowId, visibleColumnIds[index], columns, row))
            return
          }
        }
      }
      setEditSession(null)
      refocusActiveCell()
    },
    [columns, columnsById, editSession, getRowId, onRowUpdate, refocusActiveCell, rows, setFocus, visibleColumnIds],
  )

  const editingApi: GridEditingApi | undefined = editingEnabled
    ? {
        session: editSession,
        isEditable: (columnId) => isColumnEditable(columnsById.get(columnId)),
        isDirty: (rowId, columnId) => isDirtyCell(dirtyCells, rowId, columnId),
        editorFor: (columnId) => {
          const column = columnsById.get(columnId)
          return column
            ? { type: editorTypeFor(column), options: column.meta?.options }
            : { type: 'text' }
        },
        start: startEditing,
        setDraft: (columnId, value) => setEditSession((session) => (session ? setDraft(session, columnId, value) : session)),
        commit: commitEditing,
        cancel: cancelEditing,
      }
    : undefined

  return { editingApi, markDirtyCells }
}
