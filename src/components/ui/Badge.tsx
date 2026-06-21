import { cx } from './utils'

/** Shared tone vocabulary with {@link Tag} so chips read consistently. */
export type BadgeTone = 'neutral' | 'accent' | 'pos' | 'warn' | 'neg'

const toneBg: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent-soft text-accent',
  pos: 'bg-pos-soft text-pos',
  warn: 'bg-warn-soft text-warn',
  neg: 'bg-neg-soft text-neg',
}
const toneDot: Record<BadgeTone, string> = {
  neutral: 'bg-muted',
  accent: 'bg-accent',
  pos: 'bg-pos',
  warn: 'bg-warn',
  neg: 'bg-neg',
}

export interface StatusBadgeProps {
  /** Label to display — any status string; the component is schema-agnostic. */
  status: string
  /** Color tone (defaults to `neutral`). Map your domain's statuses to a tone at the call site. */
  tone?: BadgeTone
  className?: string
}

/**
 * Tone-coded label with a status dot. The kit-default is `neutral`; pass `tone`
 * to color it. Keep your domain's status→tone mapping in your own layer so this
 * primitive stays free of any specific status vocabulary (see `statusTone` in
 * the demo's accountGridColumns for the reference pattern).
 */
export function StatusBadge({ status, tone = 'neutral', className }: StatusBadgeProps) {
  return (
    <span className={cx('micro inline-flex items-center gap-1.5 rounded-pill px-1.5 py-0.5', toneBg[tone], className)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', toneDot[tone])} />
      {status}
    </span>
  )
}
