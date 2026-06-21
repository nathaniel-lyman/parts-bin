import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
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
  // Full-height guide line that tracks the cursor for the duration of the drag (viewport coords,
  // portalled to <body> so no ancestor transform can shift it). Spans the grid scroll viewport.
  const [guide, setGuide] = useState<{ x: number; top: number; height: number } | null>(null)
  const startX = useRef(0)
  const startWidth = useRef(currentWidth)

  const onPointerDown = useCallback((event: ReactPointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    startX.current = event.clientX
    startWidth.current = currentWidth
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const viewport = (event.currentTarget as HTMLElement).closest('[data-testid="datagrid-scroll"]')
    const rect = viewport?.getBoundingClientRect()
    setGuide(rect ? { x: event.clientX, top: rect.top, height: rect.height } : null)
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

    // Pointermove fires far faster than the screen repaints; coalesce into one resize per frame
    // (always using the latest X) so a fast drag doesn't dispatch dozens of RESIZE_COLUMN actions.
    let frame = 0
    let latestX = startX.current
    const onMove = (event: PointerEvent) => {
      latestX = event.clientX
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        onResize(columnId, startWidth.current + latestX - startX.current)
        setGuide((current) => (current ? { ...current, x: latestX } : current))
      })
    }
    // On release, flush the last coalesced position synchronously so the final delta is never
    // lost — without this, a drag that ends mid-frame (or a flick faster than one frame) would
    // be cancelled by the cleanup below and the column would settle a frame short of the cursor.
    const onUp = () => {
      if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
        onResize(columnId, startWidth.current + latestX - startX.current)
      }
      setGuide(null)
      setDragging(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevUserSelect
    }
  }, [columnId, dragging, onResize])

  return (
    <>
    <span
      role="separator"
      // Not a tab stop: the grid is one tab stop and keyboard resize is Ctrl+Arrow on the focused
      // header. The handle stays pointer-draggable and keeps its own key handler for completeness.
      tabIndex={-1}
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
    {guide && createPortal(
      <div
        aria-hidden="true"
        data-testid="resize-guide"
        className="pointer-events-none fixed z-50 w-0.5 -translate-x-1/2 bg-accent"
        style={{ left: guide.x, top: guide.top, height: guide.height }}
      />,
      document.body,
    )}
    </>
  )
}
