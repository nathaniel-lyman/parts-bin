import type { ReactNode } from 'react'
import type { ToastAction, ToastTone } from './ToastContext'

const edge: Record<ToastTone, string> = { accent: 'border-l-accent', pos: 'border-l-pos', neg: 'border-l-neg', warn: 'border-l-warn' }

export interface ToastProps {
  tone?: ToastTone
  title?: string
  action?: ToastAction
  /** Renders a dismiss button when provided (ToastProvider always does). */
  onDismiss?: () => void
  children: ReactNode
}

export function Toast({ tone = 'accent', title, action, onDismiss, children }: ToastProps) {
  return (
    <div className={`shadow-dropdown min-w-56 max-w-96 rounded-md border border-line border-l-2 bg-surface px-3 py-2 text-[14px] text-ink ${edge[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          {title && <span className="font-semibold">{title}</span>}
          <span className={title ? 'text-muted' : undefined}>{children}</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={onDismiss}
            className="shrink-0 text-faint hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1.5 text-[12px] font-medium text-accent hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
