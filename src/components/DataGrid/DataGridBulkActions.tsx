import { Button } from '../ui/Button'

interface Props {
  count: number
  onClear: () => void
}

export function DataGridBulkActions({ count, onClear }: Props) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-2 text-[13px] text-ink">
      <span className="micro text-muted">{count} selected</span>
      <Button size="compact" variant="ghost" aria-label="Clear selection" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}
