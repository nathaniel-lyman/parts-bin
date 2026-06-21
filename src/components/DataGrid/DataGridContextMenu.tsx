import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'

const MENU_WIDTH = 180
const VIEWPORT_GAP = 8

interface Props {
  x: number
  y: number
  selectionCount?: number
  rowPinSide?: 'top' | 'bottom' | false
  onCopyCell: () => void
  onCopyRow: () => void
  onCopySelection?: () => void
  onPinRowTop?: () => void
  onPinRowBottom?: () => void
  onUnpinRow?: () => void
  onClose: () => void
}

export function DataGridContextMenu({
  x,
  y,
  selectionCount = 0,
  rowPinSide = false,
  onCopyCell,
  onCopyRow,
  onCopySelection,
  onPinRowTop,
  onPinRowBottom,
  onUnpinRow,
  onClose,
}: Props) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    const updatePosition = () => {
      const menu = menuRef.current
      const width = menu?.offsetWidth ?? MENU_WIDTH
      const height = menu?.offsetHeight ?? 0
      const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - width - VIEWPORT_GAP)
      const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - height - VIEWPORT_GAP)
      setPosition({
        left: Math.min(Math.max(VIEWPORT_GAP, x), maxLeft),
        top: Math.min(Math.max(VIEWPORT_GAP, y), maxTop),
      })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [x, y])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const run = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <>
      <div
        data-testid="contextmenu-backdrop"
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault()
          onClose()
        }}
      />
      <div
        ref={menuRef}
        role="menu"
        aria-label="Row actions"
        className="popover-enter shadow-dropdown fixed z-50 min-w-[180px] rounded-md border border-line bg-surface py-1"
        style={{ left: position.left, top: position.top }}
      >
        <Button role="menuitem" variant="ghost" size="compact" className="w-full justify-start" onClick={run(onCopyCell)}>
          Copy cell
        </Button>
        <Button role="menuitem" variant="ghost" size="compact" className="w-full justify-start" onClick={run(onCopyRow)}>
          Copy row
        </Button>
        {selectionCount > 0 && onCopySelection && (
          <Button role="menuitem" variant="ghost" size="compact" className="w-full justify-start" onClick={run(onCopySelection)}>
            Copy selection ({selectionCount})
          </Button>
        )}
        {(onPinRowTop || onPinRowBottom || onUnpinRow) && <div className="my-1 border-t border-line" />}
        {rowPinSide !== 'top' && onPinRowTop && (
          <Button role="menuitem" variant="ghost" size="compact" className="w-full justify-start" onClick={run(onPinRowTop)}>
            Pin row to top
          </Button>
        )}
        {rowPinSide !== 'bottom' && onPinRowBottom && (
          <Button role="menuitem" variant="ghost" size="compact" className="w-full justify-start" onClick={run(onPinRowBottom)}>
            Pin row to bottom
          </Button>
        )}
        {rowPinSide !== false && onUnpinRow && (
          <Button role="menuitem" variant="ghost" size="compact" className="w-full justify-start" onClick={run(onUnpinRow)}>
            Unpin row
          </Button>
        )}
      </div>
    </>
  )
}
