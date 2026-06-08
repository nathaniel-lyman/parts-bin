import { useEffect, type RefObject } from 'react'
import { getFocusableElements } from './utils'

function getActiveElement() {
  if (typeof document === 'undefined') return null
  return document.activeElement instanceof HTMLElement ? document.activeElement : null
}

/**
 * Shared dialog focus behavior for Modal and Drawer:
 * - moves focus into the dialog on open (first focusable, else the dialog itself)
 * - Escape calls onClose
 * - Tab / Shift+Tab cycle within the dialog
 * - restores focus to the opener on unmount
 *
 * Matches the existing Modal conventions (no portal, no scroll lock).
 */
export function useDialogFocusTrap(dialogRef: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!dialogRef.current) return undefined
    const previousActiveElement = getActiveElement()
    const focusables = getFocusableElements(dialogRef.current)
    ;(focusables[0] ?? dialogRef.current)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab') return
      const currentFocusables = getFocusableElements(dialogRef.current)
      if (currentFocusables.length === 0) {
        e.preventDefault()
        dialogRef.current?.focus()
        return
      }
      const first = currentFocusables[0]
      const last = currentFocusables[currentFocusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previousActiveElement?.isConnected) previousActiveElement.focus()
    }
  }, [dialogRef, onClose])
}
