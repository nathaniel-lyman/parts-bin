export type CopyIntent = 'cell' | 'selection'

export interface CopyKeyEvent {
  key: string
  ctrlKey: boolean
  metaKey: boolean
}

export interface CopyContext {
  hasSelection: boolean
  inEditableTarget?: boolean
}

export function resolveCopyIntent(event: CopyKeyEvent, context: CopyContext): CopyIntent | null {
  if (event.key.toLowerCase() !== 'c') return null
  if (!event.ctrlKey && !event.metaKey) return null
  if (context.inEditableTarget) return null
  return context.hasSelection ? 'selection' : 'cell'
}

export interface GridFocus {
  row: number
  col: number
}

export interface GridDims {
  rowCount: number
  colCount: number
  pageRows: number
}

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value

export function moveFocus(
  focus: GridFocus,
  key: string,
  dims: GridDims,
  mods: { ctrl?: boolean } = {},
): GridFocus {
  const lastRow = Math.max(0, dims.rowCount - 1)
  const lastCol = Math.max(0, dims.colCount - 1)
  switch (key) {
    case 'ArrowDown':
      return { row: clamp(focus.row + 1, -1, lastRow), col: focus.col }
    case 'ArrowUp':
      return { row: clamp(focus.row - 1, -1, lastRow), col: focus.col }
    case 'ArrowRight':
      return { row: focus.row, col: clamp(focus.col + 1, 0, lastCol) }
    case 'ArrowLeft':
      return { row: focus.row, col: clamp(focus.col - 1, 0, lastCol) }
    case 'Home':
      return mods.ctrl ? { row: 0, col: 0 } : { row: focus.row, col: 0 }
    case 'End':
      return mods.ctrl ? { row: lastRow, col: lastCol } : { row: focus.row, col: lastCol }
    case 'PageDown':
      return { row: clamp(focus.row + dims.pageRows, 0, lastRow), col: focus.col }
    case 'PageUp':
      return { row: clamp(focus.row - dims.pageRows, 0, lastRow), col: focus.col }
    default:
      return focus
  }
}

export interface KeyEventLike {
  key: string
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey?: boolean
}

export type KeyIntent =
  | 'move'
  | 'toggle-select'
  | 'primary-action'
  | 'edit'
  | 'open-menu'
  | 'close-menu'
  | 'reorder-prev'
  | 'reorder-next'
  | 'resize-shrink'
  | 'resize-grow'
  | 'none'

const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'])

export function keyToIntent(event: KeyEventLike): KeyIntent {
  if (event.key === ' ' || event.key === 'Spacebar') return 'toggle-select'
  if (event.key === 'Enter') return 'primary-action'
  if (event.key === 'F2') return 'edit'
  if (event.key === 'Escape') return 'close-menu'
  // Alt+Down opens the focused header's column menu — the ARIA-grid way to reach a header popup
  // when the header controls are no longer individual tab stops.
  if (event.altKey && event.key === 'ArrowDown') return 'open-menu'
  const mod = event.ctrlKey || event.metaKey
  if (mod && event.key === 'ArrowLeft') return event.shiftKey ? 'reorder-prev' : 'resize-shrink'
  if (mod && event.key === 'ArrowRight') return event.shiftKey ? 'reorder-next' : 'resize-grow'
  if (MOVE_KEYS.has(event.key)) return 'move'
  return 'none'
}
