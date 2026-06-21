import { Button } from '../ui/Button'

interface Props {
  count: number
  totalMatchingCount?: number
  allMatchingRowsSelected?: boolean
  onSelectAllMatching?: () => void
  onClear: () => void
}

export function DataGridBulkActions({
  count,
  totalMatchingCount,
  allMatchingRowsSelected,
  onSelectAllMatching,
  onClear,
}: Props) {
  if (count === 0) return null
  const showMatchingAction = !allMatchingRowsSelected
    && onSelectAllMatching !== undefined
    && totalMatchingCount !== undefined
    && totalMatchingCount > count
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink">
      <span className="micro text-muted">
        {allMatchingRowsSelected && totalMatchingCount !== undefined
          ? `${totalMatchingCount} matching rows selected`
          : `${count} selected`}
      </span>
      {showMatchingAction && (
        <Button size="compact" variant="ghost" aria-label={`Select all ${totalMatchingCount} matching rows`} onClick={onSelectAllMatching}>
          Select all {totalMatchingCount} matching
        </Button>
      )}
      <Button size="compact" variant="ghost" aria-label="Clear selection" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}
