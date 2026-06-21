import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { GridFocus } from './keyboard'
import type { CellRange } from './rangeSelection'

export interface UseGridSelectionFocusArgs {
  scrollElement: HTMLDivElement | null
  rowCount: number
  rowHeight: number
}

export interface UseGridSelectionFocusResult {
  focus: GridFocus
  setFocus: Dispatch<SetStateAction<GridFocus>>
  cellRange: CellRange | null
  setCellRange: Dispatch<SetStateAction<CellRange | null>>
  /** Starts a drag-selection anchored at (row, col). */
  beginCellRange: (row: number, col: number) => void
  /** Extends the active drag-selection to (row, col); no-op unless a drag is in progress. */
  extendCellRange: (row: number, col: number) => void
  /** Requests the active cell be re-focused on the next render (e.g. after an edit commits). */
  refocusActiveCell: () => void
  /** Set `.current = true` before a navigation to have the active cell focused after it lands. */
  restoreGridFocusRef: { current: boolean }
}

/**
 * Owns roving cell focus and drag cell-range selection — the two pieces of grid state that the
 * keyboard handler, inline editing, and clipboard all read. Includes the window mouseup listener
 * that ends a drag-selection and the post-navigation focus-restore effect (which scrolls the
 * active row into the virtualized window before focusing). Extracted from the DataGrid
 * orchestrator; behaviour is identical.
 */
export function useGridSelectionFocus({
  scrollElement,
  rowCount,
  rowHeight,
}: UseGridSelectionFocusArgs): UseGridSelectionFocusResult {
  const [focus, setFocus] = useState<GridFocus>({ row: 0, col: 0 })
  const [cellRange, setCellRange] = useState<CellRange | null>(null)
  const [selectingRange, setSelectingRange] = useState(false)
  const restoreGridFocusRef = useRef(false)

  const refocusActiveCell = useCallback(() => {
    restoreGridFocusRef.current = true
    setFocus((current) => ({ ...current }))
  }, [])

  const beginCellRange = useCallback((row: number, col: number) => {
    const next = { row, col }
    setFocus(next)
    setCellRange({ anchor: next, focus: next })
    setSelectingRange(true)
  }, [])

  const extendCellRange = useCallback((row: number, col: number) => {
    if (!selectingRange) return
    const next = { row, col }
    setCellRange((current) => current ? { ...current, focus: next } : { anchor: next, focus: next })
    setFocus(next)
  }, [selectingRange])

  useEffect(() => {
    if (!selectingRange) return
    const stopSelecting = () => setSelectingRange(false)
    window.addEventListener('mouseup', stopSelecting)
    return () => window.removeEventListener('mouseup', stopSelecting)
  }, [selectingRange])

  const focusActiveCell = useCallback(() => {
    const root = scrollElement
    if (!root) return
    const selector = focus.row < 0
      ? `th[data-col-index="${focus.col}"]`
      : `td[data-row-index="${focus.row}"][data-col-index="${focus.col}"]`
    const el = root.querySelector<HTMLElement>(selector)
    if (!el) return
    el.focus()
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [focus.col, focus.row, scrollElement])

  // The React Compiler's immutability analysis flags this effect because it imperatively scrolls
  // the scroll element (a hook argument) and clears the focus-restore ref inside a deferred
  // callback — both legitimate DOM side effects the compiler can't model. This is byte-for-byte
  // the original orchestrator code, which was implicitly exempt (its TanStack hooks bail the whole
  // component out of compilation). Scope the disable to this one effect.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    if (!scrollElement) return
    if (!restoreGridFocusRef.current) return
    if (focus.row >= 0 && rowCount > 100) {
      scrollElement.scrollTop = Math.max(0, focus.row * rowHeight)
    }
    const restore = () => {
      focusActiveCell()
      restoreGridFocusRef.current = false
    }
    restore()
    const frame = requestAnimationFrame(restore)
    return () => cancelAnimationFrame(frame)
  }, [focus, focusActiveCell, rowCount, rowHeight, scrollElement])
  /* eslint-enable react-hooks/immutability */

  return {
    focus,
    setFocus,
    cellRange,
    setCellRange,
    beginCellRange,
    extendCellRange,
    refocusActiveCell,
    restoreGridFocusRef,
  }
}
