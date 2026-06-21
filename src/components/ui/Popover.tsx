import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './utils'
import { useAnchoredPosition } from './useAnchoredPosition'
import { useDialogFocusTrap } from './useDialogFocusTrap'

export interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}

export function Popover({ trigger, children, align = 'start', className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const popoverId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelStyle = useAnchoredPosition(open, triggerRef, panelRef, { align })

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 items-center justify-center rounded-sm border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2"
      >
        {trigger}
      </button>
      {open && createPortal(
        <PopoverPanel
          id={popoverId}
          panelRef={panelRef}
          style={panelStyle}
          className={className}
          onClose={() => setOpen(false)}
        >
          {children}
        </PopoverPanel>,
        document.body,
      )}
    </>
  )
}

interface PopoverPanelProps {
  id: string
  panelRef: RefObject<HTMLDivElement | null>
  style: CSSProperties
  className?: string
  onClose: () => void
  children: ReactNode
}

// Mounted only while open so the focus trap's open/close lifecycle matches
// Modal's (focus moves in on mount, restores to the opener on unmount).
function PopoverPanel({ id, panelRef, style, className, onClose, children }: PopoverPanelProps) {
  useDialogFocusTrap(panelRef, onClose)

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      tabIndex={-1}
      style={style}
      className={cx('z-50 w-72 rounded-md border border-line bg-surface p-3 text-[13px] text-ink shadow-dropdown', className)}
    >
      {children}
    </div>
  )
}
