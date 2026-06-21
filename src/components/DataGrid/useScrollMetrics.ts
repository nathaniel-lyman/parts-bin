import { useEffect, useState } from 'react'

export interface ScrollMetrics {
  left: number
  width: number
}

/**
 * Tracks the grid scroll container's horizontal scroll offset and client width — the inputs
 * to column virtualization. Re-measures on scroll and window resize. Extracted from the
 * DataGrid orchestrator; behaviour is identical.
 */
export function useScrollMetrics(scrollElement: HTMLDivElement | null): ScrollMetrics {
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>({ left: 0, width: 1024 })

  useEffect(() => {
    if (!scrollElement) return
    const update = () => setScrollMetrics({ left: scrollElement.scrollLeft, width: scrollElement.clientWidth })
    update()
    scrollElement.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      scrollElement.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [scrollElement])

  return scrollMetrics
}
