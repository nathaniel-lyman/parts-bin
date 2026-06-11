import { cloneElement, isValidElement, useEffect, useId, useState, type ReactElement, type ReactNode } from 'react'
import { cx } from './utils'

export interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const tooltipId = useId()
  // `active` mirrors hover/focus; `dismissed` is the Escape override (WCAG
  // 1.4.13) and resets whenever the pointer/focus leaves or re-enters.
  const [active, setActive] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const visible = active && !dismissed

  useEffect(() => {
    if (!visible) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [visible])

  const show = () => {
    setActive(true)
    setDismissed(false)
  }
  const hide = () => {
    setActive(false)
    setDismissed(false)
  }

  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
      'aria-describedby': [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' '),
    })
    : <span tabIndex={0} aria-describedby={tooltipId}>{children}</span>

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={visible ? undefined : true}
        className={cx(
          'pointer-events-none absolute left-1/2 z-40 w-max max-w-64 -translate-x-1/2 border border-line bg-surface px-2 py-1 text-[12px] text-ink shadow-dropdown transition-opacity',
          visible ? 'opacity-100' : 'opacity-0',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  )
}
