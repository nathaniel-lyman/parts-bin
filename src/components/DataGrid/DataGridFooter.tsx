import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

interface DataGridFooterProps {
  pageIndex: number
  pageSize: number
  pageCount: number
  totalRowCount: number
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function DataGridFooter({
  pageIndex,
  pageSize,
  pageCount,
  totalRowCount,
  onPageIndexChange,
  onPageSizeChange,
}: DataGridFooterProps) {
  const safeCount = Math.max(pageCount, 1)
  const atFirst = pageIndex <= 0
  const atLast = pageIndex >= safeCount - 1

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2 px-3 py-2">
      <label className="micro flex items-center gap-2 text-muted">
        Rows per page
        <Select
          aria-label="Rows per page"
          className="w-auto"
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      </label>
      <div className="flex items-center gap-3">
        <span className="micro text-muted">{totalRowCount} rows</span>
        <span className="micro num text-ink">Page {pageIndex + 1} of {safeCount}</span>
        <Button
          variant="secondary"
          size="compact"
          aria-label="Previous page"
          disabled={atFirst}
          onClick={() => onPageIndexChange(pageIndex - 1)}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="compact"
          aria-label="Next page"
          disabled={atLast}
          onClick={() => onPageIndexChange(pageIndex + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
