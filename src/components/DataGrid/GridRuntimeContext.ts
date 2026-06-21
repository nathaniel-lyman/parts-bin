import { createContext, useContext, type ReactNode } from 'react'
import type { ColumnDragPreviewState } from './dragPreview'
import type { GridEditingApi } from './editing'
import type { PinnedOffsets } from './selectors'
import type { ColumnVirtualWindow } from './types'

/**
 * Runtime-wide values shared by every rendered row and cell. Hoisting these into context (instead
 * of drilling them Body → Row → Cell on every render) is what lets `DataGridRow`/`DataGridCell` be
 * `React.memo`'d: the per-row props that actually differ stay props, while these identity-constant
 * values live here. The orchestrator builds a single memoized value so that a render which changes
 * only per-row state (a selection toggle, one row's data) does not churn this object — keeping the
 * memoized children skippable.
 *
 * Deliberately excluded: `focus` and `range`. Those change on every arrow-key press; routing them
 * through context would re-render every consumer. Instead the body derives narrow per-row primitives
 * (`focusedColIndex`, `rangeColStart`/`rangeColEnd`) so only the rows/cells that gained or lost
 * focus/selection re-render.
 */
export interface GridRuntime {
  enableRowSelection: boolean
  /** Visible leaf-column ids in render order — drives per-cell column index + tree-column default. */
  visibleColumnIds: string[]
  /** Column that receives tree indentation/expand controls; falls back to the first non-locked column. */
  treeColumnId?: string
  dragPreview?: ColumnDragPreviewState | null
  editing?: GridEditingApi
  pinnedOffsets?: PinnedOffsets
  columnWindow?: ColumnVirtualWindow
  onToggleRow?: (id: string) => void
  onCellContextMenu?: (rowId: string, colId: string, clientX: number, clientY: number) => void
  onCopyCell?: (rowId: string, colId: string) => void
  onFocusCell?: (row: number, col: number) => void
  onRangeStart?: (row: number, col: number) => void
  onRangeEnter?: (row: number, col: number) => void
  /** Renders the aggregated value for a grouped column; leaf rows are the group's leaf `original`s. */
  renderAggregatedCell?: (columnId: string, leafRows: unknown[]) => ReactNode
}

/**
 * Complete default so that rows/cells rendered without a provider (e.g. focused component tests)
 * still work — every field is optional behaviour-wise, with selection off and no handlers.
 */
const DEFAULT_RUNTIME: GridRuntime = {
  enableRowSelection: false,
  visibleColumnIds: [],
}

const GridRuntimeContext = createContext<GridRuntime>(DEFAULT_RUNTIME)

export const GridRuntimeProvider = GridRuntimeContext.Provider

export function useGridRuntime(): GridRuntime {
  return useContext(GridRuntimeContext)
}
