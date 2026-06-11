import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../ui/utils'

export interface ChatMessageListProps {
  children: ReactNode
  className?: string
}

const STICK_THRESHOLD = 32

/**
 * Scroll container that follows streaming output: stays pinned to the bottom
 * while content grows, releases when the user scrolls up to read, re-pins
 * when they return to the bottom.
 */
export function ChatMessageList({ children, className }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stuckRef = useRef(true)

  // Re-pin on every render (covers each token append; cheap — one property write).
  useEffect(() => {
    const el = scrollRef.current
    if (el && stuckRef.current) el.scrollTop = el.scrollHeight
  })

  // Also re-pin on pure size changes (images/fonts settling) where no render occurs.
  useEffect(() => {
    const el = scrollRef.current
    const inner = el?.firstElementChild
    if (!el || !inner || typeof ResizeObserver === 'undefined') return // jsdom: render effect above suffices
    const observer = new ResizeObserver(() => {
      if (stuckRef.current) el.scrollTop = el.scrollHeight
    })
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stuckRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD
  }

  return (
    <div ref={scrollRef} onScroll={onScroll} className={cx('min-h-0 flex-1 overflow-y-auto', className)}>
      <div role="log" className="grid gap-4">{children}</div>
    </div>
  )
}
