import type { ReactNode } from 'react'
import { cx } from './utils'

export type BannerTone = 'accent' | 'pos' | 'warn' | 'neg'

const tones: Record<BannerTone, string> = {
  accent: 'bg-accent-soft text-accent',
  pos: 'bg-pos-soft text-pos',
  warn: 'bg-warn-soft text-warn',
  neg: 'bg-neg-soft text-neg',
}

export interface BannerProps {
  tone?: BannerTone
  children: ReactNode
  /** Trailing action slot (e.g. an Upgrade button or link). */
  action?: ReactNode
  /** Renders a dismiss button when provided. */
  onDismiss?: () => void
  className?: string
}

/**
 * Full-width app/page-level announcement bar (maintenance windows, trial
 * expiry, environment notices). For a message scoped to a section or form,
 * use InlineAlert; for transient feedback, use a toast.
 */
export function Banner({ tone = 'accent', children, action, onDismiss, className }: BannerProps) {
  return (
    <div role="status" className={cx('flex items-center gap-3 px-4 py-2 text-[14px]', tones[tone], className)}>
      <p className="m-0 min-w-0 flex-1 font-medium">{children}</p>
      {action}
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
