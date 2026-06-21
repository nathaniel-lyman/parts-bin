import { useEffect, useState } from 'react'

export interface ScrollMetrics {
  left: number
  width: number
}

/**
 * Tracks the grid scroll container's horizontal scroll offset and client width — the inputs
 * to column virtualization. Scroll and resize events fire faster than the screen repaints, so the
 * re-measure is coalesced into a single `requestAnimationFrame` per frame, and the state update
 * bails out when neither value actually changed (so vertical scrolling never re-renders the grid).
 * The initial measurement stays synchronous so the first paint has real dimensions.
 */
export function useScrollMetrics(scrollElement: HTMLDivElement | null): ScrollMetrics {
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({ left: 0, width: 1024 })

  useEffect(() => {
    if (!scrollElement) return
    let frame = 0
    const measure = () => {
      frame = 0
      const left = scrollElement.scrollLeft
      const width = scrollElement.clientWidth
      setScrollMetrics((prev) => (prev.left === left && prev.width === width ? prev : { left, width }))
    }
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }
    measure()
    scrollElement.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      scrollElement.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [scrollElement])

  return scrollMetrics
}
