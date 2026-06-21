import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { Row } from '@tanstack/react-table'
import { useToast } from '../ui'
import { copyToClipboard, downloadCSV, downloadXLSX, serializeCSV, serializeCell, serializeTSV, serializeXLSX } from './export'
import { cellRangeBounds, isMultiCellRange, parseClipboardTable, serializeCellRange, type CellRange } from './rangeSelection'
import { resolveCopyIntent, type GridFocus } from './keyboard'
import { editorTypeFor, isColumnEditable, parseDraft } from './editing'
import { formatDataGridNumber, isNumericColumnType } from './numberFormat'
import type { GridQuery } from './query'
import type { DataGridColumn, DataGridNumberFormat } from './types'

export interface UseGridClipboardArgs<TData> {
  rows: TData[]
  columns: DataGridColumn<TData>[]
  columnsById: Map<string, DataGridColumn<TData>>
  getRowId: (row: TData) => string
  visibleData: TData[]
  visibleColumnIds: string[]
  visibleRows: Row<TData>[]
  exportData: TData[]
  exportFilename: string
  cellRange: CellRange | null
  focus: GridFocus
  visibleSelectedCount: number
  columnOrder: string[]
  columnVisibility: Record<string, boolean>
  numberFormats: Record<string, DataGridNumberFormat>
  rowSelection: Record<string, boolean>
  editingEnabled: boolean
  onRowUpdate?: (rowId: string, patch: Partial<TData>, row: TData) => void
  markDirtyCells: (rowId: string, columnIds: string[]) => void
  allMatchingQuery: GridQuery
  onExportAllCsv?: (query: GridQuery) => void
  onExportAllXlsx?: (query: GridQuery) => void
}

export interface UseGridClipboardResult {
  /** Attach to the grid root: the window copy/paste listeners only fire when focus is inside it. */
  rootRef: RefObject<HTMLDivElement | null>
  copyCell: (rowId: string, colId: string) => void
  copyRow: (rowId: string) => void
  copySelection: () => void
  copyRange: () => boolean
  pasteTable: (text: string) => boolean
  /** Fills the active multi-cell range: each column takes its top (anchor) row's value down the
   *  range. Reuses the paste-fill validate/update path. No-op unless editing + a multi-cell range. */
  fillSelection: () => boolean
  exportCsv: () => void
  exportXlsx: () => void
  exportAllCsv: () => void
  exportAllXlsx: () => void
}

/**
 * Owns all clipboard + file-export behaviour: cell/row/selection/range copy (as formatted TSV),
 * CSV/XLSX download (client and server-scoped), and paste-into-cells. Installs window-level
 * copy/paste listeners scoped to the grid root that defer to native text selections and editable
 * targets. Extracted from the DataGrid orchestrator; behaviour is identical.
 */
export function useGridClipboard<TData>({
  rows,
  columns,
  columnsById,
  getRowId,
  visibleData,
  visibleColumnIds,
  visibleRows,
  exportData,
  exportFilename,
  cellRange,
  focus,
  visibleSelectedCount,
  columnOrder,
  columnVisibility,
  numberFormats,
  rowSelection,
  editingEnabled,
  onRowUpdate,
  markDirtyCells,
  allMatchingQuery,
  onExportAllCsv,
  onExportAllXlsx,
}: UseGridClipboardArgs<TData>): UseGridClipboardResult {
  const toast = useToast()
  const visibleSelectedCountRef = useRef(visibleSelectedCount)
  const focusTargetRef = useRef<{ rowId: string; colId: string } | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Keep the "latest" refs the window listeners read current with each commit. Done in an effect
  // (not during render) so it is safe under StrictMode double-invoke and concurrent rendering; the
  // listeners only fire on user interaction, well after the effect has flushed.
  useEffect(() => {
    visibleSelectedCountRef.current = visibleSelectedCount
    focusTargetRef.current = focus.row < 0
      ? null
      : (() => {
          const row = visibleRows[focus.row]
          const colId = visibleColumnIds[focus.col]
          return row && colId ? { rowId: row.id, colId } : null
        })()
  })

  const resolveCellValue = useCallback(
    (row: TData, columnId: string): unknown => {
      const column = columns.find((item) => item.id === columnId)
      if (!column) return ''
      if (column.accessorFn) return column.accessorFn(row)
      if (column.accessorKey) return (row as Record<string, unknown>)[column.accessorKey as string]
      return ''
    },
    [columns],
  )

  // The clipboard-facing value: the column's `exportValue` formatter when present (so a copied
  // currency/percent cell lands in Excel as "$24,600" / "-2.1%"), else the raw value. Kept separate
  // from resolveCellValue, which paste compares against and must stay raw.
  const resolveCellExportValue = useCallback(
    (row: TData, columnId: string): unknown => {
      const raw = resolveCellValue(row, columnId)
      const column = columnsById.get(columnId)
      if (column && isNumericColumnType(column.type)) {
        return formatDataGridNumber(raw, column.type, column.numberFormat, numberFormats[columnId])
      }
      return column?.exportValue ? column.exportValue(raw, row) : raw
    },
    [columnsById, numberFormats, resolveCellValue],
  )

  // Header label for the copied column range. Falls back to the id for non-string headers.
  const columnHeaderLabel = useCallback(
    (columnId: string): string => {
      const column = columnsById.get(columnId)
      return column && typeof column.header === 'string' ? column.header : columnId
    },
    [columnsById],
  )

  // Writes to the clipboard and toasts on success; the two-argument then scopes the
  // error-swallow to the clipboard write only (a throw from toast() would still surface).
  const copyWithFeedback = useCallback((text: string, message: string) => {
    void copyToClipboard(text).then(() => toast(message), () => {})
  }, [toast])

  const copyRange = useCallback(() => {
    if (!cellRange || !isMultiCellRange(cellRange)) return false
    const text = serializeCellRange(cellRange, visibleData, visibleColumnIds, resolveCellExportValue, {
      header: columnHeaderLabel,
    })
    if (!text) return false
    const bounds = cellRangeBounds(cellRange)
    const cells = (bounds.rowEnd - bounds.rowStart + 1) * (bounds.colEnd - bounds.colStart + 1)
    copyWithFeedback(text, cells === 1 ? 'Copied cell' : `Copied ${cells} cells`)
    return true
  }, [cellRange, columnHeaderLabel, copyWithFeedback, resolveCellExportValue, visibleColumnIds, visibleData])

  const copyCell = useCallback(
    (rowId: string, colId: string) => {
      const row = visibleData.find((item) => getRowId(item) === rowId) ?? rows.find((item) => getRowId(item) === rowId)
      if (!row) return
      copyWithFeedback(serializeCell(resolveCellExportValue(row, colId)), 'Copied cell')
    },
    [copyWithFeedback, getRowId, resolveCellExportValue, rows, visibleData],
  )

  const copyRow = useCallback(
    (rowId: string) => {
      const row = visibleData.find((item) => getRowId(item) === rowId) ?? rows.find((item) => getRowId(item) === rowId)
      if (!row) return
      copyWithFeedback(serializeTSV([row], columns, {
        getRowId,
        columnOrder,
        columnVisibility,
        includeHeader: false,
        formatted: true,
        numberFormats,
      }), 'Copied row')
    },
    [columnOrder, columnVisibility, columns, copyWithFeedback, getRowId, numberFormats, rows, visibleData],
  )

  const copySelection = useCallback(() => {
    // Count what serializeTSV actually emits: selected ∩ currently visible (hidden-but-selected
    // rows are not copied, so they must not be counted in the toast).
    const copiedCount = visibleData.filter((row) => rowSelection[getRowId(row)]).length
    // Every selected row is filtered out: skip the (header-only) write and the toast entirely.
    if (copiedCount === 0) return
    copyWithFeedback(serializeTSV(visibleData, columns, {
      getRowId,
      columnOrder,
      columnVisibility,
      rowSelection,
      formatted: true,
      numberFormats,
    }), copiedCount === 1 ? 'Copied 1 row' : `Copied ${copiedCount} rows`)
  }, [columnOrder, columnVisibility, columns, copyWithFeedback, getRowId, numberFormats, rowSelection, visibleData])

  const exportCsv = useCallback(() => {
    downloadCSV(exportFilename, serializeCSV(exportData, columns, {
      getRowId,
      columnOrder,
      columnVisibility,
      rowSelection,
    }))
  }, [columnOrder, columnVisibility, columns, exportData, exportFilename, getRowId, rowSelection])

  const exportXlsx = useCallback(() => {
    const filename = exportFilename.replace(/\.csv$/i, '') || 'data-grid'
    downloadXLSX(`${filename}.xlsx`, serializeXLSX(exportData, columns, {
      getRowId,
      columnOrder,
      columnVisibility,
      rowSelection,
    }))
  }, [columnOrder, columnVisibility, columns, exportData, exportFilename, getRowId, rowSelection])

  const exportAllCsv = useCallback(() => {
    onExportAllCsv?.(allMatchingQuery)
  }, [allMatchingQuery, onExportAllCsv])

  const exportAllXlsx = useCallback(() => {
    onExportAllXlsx?.(allMatchingQuery)
  }, [allMatchingQuery, onExportAllXlsx])

  const pasteTable = useCallback((text: string) => {
    if (!editingEnabled || !onRowUpdate) return false
    const incoming = parseClipboardTable(text)
    if (incoming.length === 0 || incoming[0]?.length === 0) return false

    const rangeBounds = cellRange ? cellRangeBounds(cellRange) : null
    const startRow = rangeBounds?.rowStart ?? focus.row
    const startCol = rangeBounds?.colStart ?? focus.col
    if (startRow < 0 || startCol < 0) return false

    const fillRange = Boolean(rangeBounds && isMultiCellRange(cellRange) && incoming.length === 1 && incoming[0]?.length === 1)
    const rowSpan = fillRange && rangeBounds ? rangeBounds.rowEnd - rangeBounds.rowStart + 1 : incoming.length
    const colSpan = fillRange && rangeBounds ? rangeBounds.colEnd - rangeBounds.colStart + 1 : Math.max(...incoming.map((row) => row.length))
    let changedCells = 0
    let attemptedEditableCells = 0

    for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
      const row = visibleData[startRow + rowOffset]
      if (!row) continue
      const rowId = getRowId(row)
      const patch: Record<string, unknown> = {}
      const changedColumnIds: string[] = []

      for (let colOffset = 0; colOffset < colSpan; colOffset += 1) {
        const columnId = visibleColumnIds[startCol + colOffset]
        const column = columnId ? columnsById.get(columnId) : undefined
        if (!column || !isColumnEditable(column)) continue
        attemptedEditableCells += 1

        const draft = fillRange ? incoming[0]?.[0] : incoming[rowOffset]?.[colOffset]
        if (draft === undefined) continue
        const parsed = parseDraft(editorTypeFor(column), draft)
        if (parsed.error) continue
        const validationMessage = column.validate?.(parsed.value as never, row)
        if (validationMessage) continue
        if (parsed.value === resolveCellValue(row, column.id)) continue
        patch[column.accessorKey as string] = parsed.value
        changedColumnIds.push(column.id)
      }

      if (changedColumnIds.length > 0) {
        onRowUpdate(rowId, patch as Partial<TData>, row)
        markDirtyCells(rowId, changedColumnIds)
        changedCells += changedColumnIds.length
      }
    }

    if (changedCells > 0) {
      toast(changedCells === 1 ? 'Pasted 1 cell' : `Pasted ${changedCells} cells`)
      return true
    }
    if (attemptedEditableCells > 0) {
      toast('Nothing pasted')
      return true
    }
    return false
  }, [
    cellRange,
    columnsById,
    editingEnabled,
    focus.col,
    focus.row,
    getRowId,
    markDirtyCells,
    onRowUpdate,
    resolveCellValue,
    toast,
    visibleColumnIds,
    visibleData,
  ])

  const fillSelection = useCallback(() => {
    if (!editingEnabled || !onRowUpdate || !cellRange || !isMultiCellRange(cellRange)) return false
    const bounds = cellRangeBounds(cellRange)
    const sourceRow = visibleData[bounds.rowStart]
    if (!sourceRow) return false
    let changedCells = 0

    for (let rowIndex = bounds.rowStart; rowIndex <= bounds.rowEnd; rowIndex += 1) {
      const row = visibleData[rowIndex]
      if (!row) continue
      const rowId = getRowId(row)
      const patch: Record<string, unknown> = {}
      const changedColumnIds: string[] = []

      for (let colIndex = bounds.colStart; colIndex <= bounds.colEnd; colIndex += 1) {
        const columnId = visibleColumnIds[colIndex]
        const column = columnId ? columnsById.get(columnId) : undefined
        if (!column || !isColumnEditable(column)) continue
        // Source value is already a typed cell value (not a clipboard string), so it skips
        // parseDraft and feeds straight into the same validate → onRowUpdate path as paste.
        const sourceValue = resolveCellValue(sourceRow, columnId)
        if (sourceValue === resolveCellValue(row, columnId)) continue
        if (column.validate?.(sourceValue as never, row)) continue
        patch[column.accessorKey as string] = sourceValue
        changedColumnIds.push(column.id)
      }

      if (changedColumnIds.length > 0) {
        onRowUpdate(rowId, patch as Partial<TData>, row)
        markDirtyCells(rowId, changedColumnIds)
        changedCells += changedColumnIds.length
      }
    }

    if (changedCells > 0) {
      toast(changedCells === 1 ? 'Filled 1 cell' : `Filled ${changedCells} cells`)
      return true
    }
    return false
  }, [
    cellRange,
    columnsById,
    editingEnabled,
    getRowId,
    markDirtyCells,
    onRowUpdate,
    resolveCellValue,
    toast,
    visibleColumnIds,
    visibleData,
  ])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const active = document.activeElement
      const editableInput =
        active instanceof HTMLInputElement &&
        ['email', 'number', 'password', 'search', 'tel', 'text', 'url'].includes(active.type)
      const inEditableTarget =
        editableInput ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      const isCopyCombo = event.key.toLowerCase() === 'c' && (event.ctrlKey || event.metaKey)
      const isPasteCombo = event.key.toLowerCase() === 'v' && (event.ctrlKey || event.metaKey)
      if (!isCopyCombo && !isPasteCombo) return
      // Both clipboard intents are window-level, so scope them hard: focus must live inside this
      // grid, and a native text selection always wins over us (let the browser copy it).
      if (!rootRef.current || !active || !rootRef.current.contains(active)) return
      if (inEditableTarget) return
      if (window.getSelection()?.isCollapsed === false) return
      if (isPasteCombo) return
      if (copyRange()) return
      const intent = resolveCopyIntent(event, { hasSelection: visibleSelectedCountRef.current > 0, inEditableTarget })
      if (!intent) return
      if (intent === 'selection') {
        copySelection()
        return
      }
      if (!(active instanceof HTMLElement) || !active.closest('td[data-col-index]')) return
      const target = focusTargetRef.current
      if (target && target.colId !== 'actions') copyCell(target.rowId, target.colId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copyCell, copyRange, copySelection])

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const active = document.activeElement
      if (!rootRef.current || !active || !rootRef.current.contains(active)) return
      const inEditableTarget =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      if (inEditableTarget) return
      const text = event.clipboardData?.getData('text/plain') ?? ''
      if (!text) return
      if (!pasteTable(text)) return
      event.preventDefault()
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [pasteTable])

  return {
    rootRef,
    copyCell,
    copyRow,
    copySelection,
    copyRange,
    pasteTable,
    fillSelection,
    exportCsv,
    exportXlsx,
    exportAllCsv,
    exportAllXlsx,
  }
}
