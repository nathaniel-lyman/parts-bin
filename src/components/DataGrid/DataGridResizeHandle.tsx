import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { keyToIntent } from './keyboard'

interface Props {
  columnId: string
  header: string
  currentWidth: number
  onResize: (id: string, width: number) => void
  onAutofit: (id: string) => void
}

export function DataGridResizeHandle({ columnId, header, currentWidth, onResize, onAutofit }: Props) {
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(currentWidth)

  const onPointerDown = useCallback((event: ReactPointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    startX.current = event.clientX
    startWidth.current = currentWidth
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDragging(true)
  }, [currentWidth])

  useEffect(() => {
    if (!dragging) return

    // Lock the page cursor + suppress text selection for the duration of the drag so the
    // pointer never flickers and stray selections don't appear across the app.
    const prevCursor = document.body.style.cursor
    const prevUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (event: PointerEvent) => {
      onResize(columnId, startWidth.current + event.clientX - startX.current)
    }
    const onUp = () => setDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevUserSelect
    }
  }, [columnId, dragging, onResize])

  return (
    <span
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={`Resize ${header} column`}
      onKeyDown={(event) => {
        const intent = keyToIntent(event)
        if (intent !== 'resize-shrink' && intent !== 'resize-grow') return
        event.preventDefault()
        event.stopPropagation()
        onResize(columnId, currentWidth + (intent === 'resize-grow' ? 16 : -16))
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={(event) => {
        event.stopPropagation()
        onAutofit(columnId)
      }}
      onClick={(event) => event.stopPropagation()}
      // 8px grab zone straddling the column border for an easy target; a 1px line shows on hover.
      className={`absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize touch-none select-none after:absolute after:right-1 after:top-0 after:h-full after:w-px after:bg-transparent hover:after:bg-accent ${dragging ? 'after:bg-accent' : ''}`}
    />
  )
}
