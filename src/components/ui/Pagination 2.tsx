import { Button } from './Button'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(page, 1), pageCount)
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(total, currentPage * pageSize)

  return (
    <nav className="flex flex-wrap items-center justify-between gap-2 border border-line bg-surface px-3 py-2" aria-label="Pagination">
      <span className="num text-[12px] text-muted">
        {start}-{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button size="compact" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          Prev
        </Button>
        <span className="num text-[12px] text-muted">
          {currentPage} / {pageCount}
        </span>
        <Button size="compact" disabled={currentPage >= pageCount} onClick={() => onPageChange(currentPage + 1)}>
          Next
        </Button>
      </div>
    </nav>
  )
}
