import { useEffect } from 'react'
import { Button } from '../ui/Button'

interface Props {
  x: number
  y: number
  selectionCount?: number
  onCopyCell: () => void
  onCopyRow: () => void
  onCopySelection?: () => void
  onClose: () => void
}

export function DataGridContextMenu({
  x,
  y,
  selectionCount = 0,
  onCopyCell,
  onCopyRow,
  onCopySelection,
  onClose,
}: Props) {
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
        role="menu"
        aria-label="Row actions"
        className="shadow-dropdown fixed z-50 min-w-[140px] rounded-[2px] border border-line bg-surface py-1"
        style={{ left: x, top: y }}
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
      </div>
    </>
  )
}
