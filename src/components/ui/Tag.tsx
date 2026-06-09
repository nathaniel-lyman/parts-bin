import { cx } from './utils'

export type TagTone = 'neutral' | 'accent' | 'pos' | 'warn' | 'neg'

const tones: Record<TagTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent-soft text-accent',
  pos: 'bg-pos-soft text-pos',
  warn: 'bg-warn-soft text-warn',
  neg: 'bg-neg-soft text-neg',
}

export interface TagProps {
  label: string
  tone?: TagTone
  /** Renders a remove button after the label. */
  onRemove?: () => void
  className?: string
}

/**
 * General-purpose label chip for categories, topics, and token values.
 * For lifecycle status use StatusBadge; for active filters use
 * AppliedFiltersBar's chips.
 */
export function Tag({ label, tone = 'neutral', onRemove, className }: TagProps) {
  return (
    <span className={cx('micro inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5', tones[tone], className)}>
      {label}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="-mr-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] hover:bg-surface/60"
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </span>
  )
}
