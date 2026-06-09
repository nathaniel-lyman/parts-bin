import { useId, type ReactNode } from 'react'
import { cx } from './utils'

export type ProgressTone = 'accent' | 'pos' | 'warn' | 'neg'

const fillTone: Record<ProgressTone, string> = {
  accent: 'bg-accent',
  pos: 'bg-pos',
  warn: 'bg-warn',
  neg: 'bg-neg',
}

export interface ProgressProps {
  /** Current value; clamped into [0, max]. */
  value: number
  max?: number
  tone?: ProgressTone
  /** Visible caption to the left of the track; also labels the bar. */
  label?: ReactNode
  /** Show the percentage to the right of the caption row. */
  showValue?: boolean
  className?: string
  'aria-label'?: string
}

/**
 * Determinate progress bar for quotas, capacity, and completion. For
 * indeterminate loading states use Spinner or the Loading* animations.
 */
export function Progress({
  value,
  max = 100,
  tone = 'accent',
  label,
  showValue = false,
  className,
  'aria-label': ariaLabel,
}: ProgressProps) {
  const labelId = useId()
  const clamped = Math.min(Math.max(value, 0), max)
  const percent = max > 0 ? Math.round((clamped / max) * 100) : 0

  return (
    <div className={cx('grid gap-1', className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && <span id={labelId} className="text-[12px] font-medium text-ink">{label}</span>}
          {showValue && <span className="num text-[12px] text-muted">{percent}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        className="h-1.5 w-full overflow-hidden rounded-[2px] bg-surface-2"
      >
        <div className={cx('h-full rounded-[2px]', fillTone[tone])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
