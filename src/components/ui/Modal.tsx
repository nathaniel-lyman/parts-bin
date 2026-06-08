import { useId, useRef, type ReactNode } from 'react'
import { useDialogFocusTrap } from './useDialogFocusTrap'

interface Props { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }

export function Modal({ title, onClose, children, footer }: Props) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocusTrap(dialogRef, onClose)

  return (
    <div
      className="scrim-backdrop fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-[480px] max-w-[92vw] rounded-[4px] bg-surface border border-line shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-[16px] font-semibold text-ink display">{title}</h2>
          <button aria-label="Close" className="text-muted hover:text-ink" onClick={onClose}>✕</button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</div>}
      </div>
    </div>
  )
}
