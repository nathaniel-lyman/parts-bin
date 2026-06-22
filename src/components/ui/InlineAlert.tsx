import type { ReactNode } from 'react'
import { cx } from './utils'
import { IconButton } from './IconButton'

export type InlineAlertTone = 'accent' | 'pos' | 'neg' | 'warn'

export interface InlineAlertProps {
  tone?: InlineAlertTone
  title?: ReactNode
  children: ReactNode
  action?: ReactNode
  onDismiss?: () => void
  className?: string
}

const edge: Record<InlineAlertTone, string> = {
  accent: 'border-l-accent',
  pos: 'border-l-pos',
  neg: 'border-l-neg',
  warn: 'border-l-warn',
}
const titleTone: Record<InlineAlertTone, string> = {
  accent: 'text-accent',
  pos: 'text-pos',
  neg: 'text-neg',
  warn: 'text-warn',
}

/** Inline, non-floating counterpart to Toast: tone-coded left edge, optional title/action/dismiss. */
export function InlineAlert({ tone = 'accent', title, children, action, onDismiss, className }: InlineAlertProps) {
  const role = tone === 'neg' || tone === 'warn' ? 'alert' : 'status'
  return (
    <div
      role={role}
      className={cx(
        'flex items-start gap-3 rounded-md border border-line border-l-2 bg-surface px-3 py-2 text-[14px] text-ink',
        edge[tone],
        className,
      )}
    >
      <div className="grid min-w-0 flex-1 gap-1">
        {title && <div className={cx('font-semibold', titleTone[tone])}>{title}</div>}
        <div>{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onDismiss && (
        <IconButton size="compact" aria-label="Dismiss" onClick={onDismiss}>✕</IconButton>
      )}
    </div>
  )
}
