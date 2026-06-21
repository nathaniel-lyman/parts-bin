import { useLayoutEffect, useState } from 'react'
import { pinnedOffsets as computePinnedColumnOffsets, type PinnedOffsets } from './selectors'

const EMPTY_OFFSETS: PinnedOffsets = { left: {}, right: {} }

function sameSide(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((key) => a[key] === b[key])
}

function sameOffsets(a: PinnedOffsets, b: PinnedOffsets): boolean {
  return sameSide(a.left, b.left) && sameSide(a.right, b.right)
}

export interface UsePinnedColumnOffsetsArgs {
  scrollElement: HTMLDivElement | null
  pinnedGroups: { left: string[]; right: string[] }
  visibleColumnIds: string[]
  columnSizing: Record<string, number>
  density: string
  scrollWidth: number
  enableRowSelection?: boolean
}

/**
 * Measures the rendered sticky offsets for pinned columns. The `w-full` table stretches columns
 * past their logical `getSize()`, and the selection column has no fixed width — so the offsets
 * must be measured from the DOM rather than computed from column sizes. `pinnedKey`/`layoutKey`
 * capture every layout input that can change those measured widths. Extracted from the DataGrid
 * orchestrator; behaviour is identical.
 */
export function usePinnedColumnOffsets({
  scrollElement,
  pinnedGroups,
  visibleColumnIds,
  columnSizing,
  density,
  scrollWidth,
  enableRowSelection,
}: UsePinnedColumnOffsetsArgs): PinnedOffsets {
  const [pinnedColumnOffsets, setPinnedColumnOffsets] = useState<PinnedOffsets>({ left: {}, right: {} })

  const pinnedKey = `${pinnedGroups.left.join(',')}|${pinnedGroups.right.join(',')}`
  const layoutKey = `${visibleColumnIds.join(',')}|${JSON.stringify(columnSizing)}|${density}|${scrollWidth}|${enableRowSelection}`

  // This is the sanctioned useLayoutEffect-measures-DOM-then-syncs-state pattern: pinned sticky
  // offsets can only be known from rendered widths, so they must be measured post-layout and stored
  // in state to render. Both setState calls bail out when the value is unchanged (referential
  // equality), so there is no cascading-render loop.
  useLayoutEffect(() => {
    if (!scrollElement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset-to-empty sync, guarded by referential bail-out
      setPinnedColumnOffsets((prev) => (prev.left === EMPTY_OFFSETS.left ? prev : EMPTY_OFFSETS))
      return
    }
    const headerRow = scrollElement.querySelector('tr[data-testid="grid-header-row"]')
    if (!headerRow) return
    const widths: Record<string, number> = {}
    headerRow.querySelectorAll<HTMLElement>('th[data-column-id]').forEach((th) => {
      widths[th.dataset.columnId!] = th.getBoundingClientRect().width
    })
    const leadingTh = headerRow.querySelector<HTMLElement>('th:not([data-column-id])')
    const leadingOffset = enableRowSelection && leadingTh ? leadingTh.getBoundingClientRect().width : 0
    const next = computePinnedColumnOffsets({ left: pinnedGroups.left, right: pinnedGroups.right }, widths, leadingOffset)
    setPinnedColumnOffsets((prev) => (sameOffsets(prev, next) ? prev : next))
    // pinnedKey/layoutKey capture every layout input; pinnedGroups are derived from them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollElement, pinnedKey, layoutKey])

  return pinnedColumnOffsets
}
