import { LoadingProgress } from '../ui'

export function DataGridLoadingState() {
  return (
    <div className="grid justify-items-center px-3 py-8 text-muted" aria-live="polite">
      <LoadingProgress label="Loading rows" detail="Loading grid rows" />
    </div>
  )
}

/**
 * Placeholder body rendered during the initial load so the grid keeps its shape instead of
 * collapsing the tbody. Each cell is a token-backed shimmer bar (reuses `.ledger-loading-shimmer`,
 * which reduced-motion already gates). Deterministic per-column widths avoid `Math.random` and keep
 * renders stable. Purely decorative — `aria-hidden`; the centered loading overlay carries the
 * live-region announcement.
 */
export function DataGridSkeletonRows({
  rowCount = 8,
  columnCount,
  enableRowSelection = false,
}: {
  rowCount?: number
  columnCount: number
  enableRowSelection?: boolean
}) {
  // A small repeating set of widths so columns read as varied content, not a uniform block.
  const widths = [62, 84, 47, 73, 55, 90, 68]
  return (
    <tbody aria-hidden="true" data-testid="grid-skeleton">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-t border-line" style={{ height: 'var(--row-h)' }}>
          {enableRowSelection && (
            <td className="w-10 px-2">
              <span className="ledger-loading-shimmer block h-3.5 w-3.5 rounded-sm" />
            </td>
          )}
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <td key={colIndex} className="px-3">
              <span
                className="ledger-loading-shimmer block h-3 rounded-sm"
                style={{ width: `${widths[(rowIndex + colIndex) % widths.length]}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
