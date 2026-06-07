import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { keyToIntent } from './keyboard'

interface Props {
  columnId: string
  header: string
  currentWidth: number
  onResize: (id: string, width: number) => void
  onReset: (id: string) => void
}

export function DataGridResizeHandle({ columnId, header, currentWidth, onResize, onReset }: Props) {
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(currentWidth)

  const onMouseDown = useCallback((event: ReactMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    startX.current = event.clientX
    startWidth.current = currentWidth
    setDragging(true)
  }, [currentWidth])

  useEffect(() => {
    if (!dragging) return

    const onMove = (event: MouseEvent) => {
      onResize(columnId, startWidth.current + event.clientX - startX.current)
    }
    const onUp = () => setDragging(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
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
      onMouseDown={onMouseDown}
      onDoubleClick={(event) => {
        event.stopPropagation()
        onReset(columnId)
      }}
      onClick={(event) => event.stopPropagation()}
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-accent"
    />
  )
}
