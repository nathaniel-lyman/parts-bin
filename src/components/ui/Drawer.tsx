import { useId, useRef, type ReactNode } from 'react'
import { cx } from './utils'
import { IconButton } from './IconButton'
import { useDialogFocusTrap } from './useDialogFocusTrap'

export interface DrawerProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  side?: 'right' | 'left'
}

/** Slide-in side panel. Shares Modal's focus-trap behavior (no portal, no scroll lock). */
export function Drawer({ title, onClose, children, footer, side = 'right' }: DrawerProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocusTrap(dialogRef, onClose)

  return (
    <div
      className={cx('scrim-backdrop fixed inset-0 z-50 flex', side === 'right' ? 'justify-end' : 'justify-start')}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'flex h-full w-[420px] max-w-[92vw] flex-col bg-surface shadow-modal',
          side === 'right' ? 'border-l border-line' : 'border-r border-line',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id={titleId} className="display text-[16px] font-semibold text-ink">{title}</h2>
          <IconButton size="compact" aria-label="Close" onClick={onClose}>✕</IconButton>
        </div>
        <div className="flex-1 overflow-auto px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
      </div>
    </div>
  )
}
