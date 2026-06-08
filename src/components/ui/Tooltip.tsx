import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import { cx } from './utils'

export interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const tooltipId = useId()
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
      'aria-describedby': [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' '),
    })
    : <span tabIndex={0} aria-describedby={tooltipId}>{children}</span>

  return (
    <span className="group relative inline-flex">
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        className={cx(
          'pointer-events-none absolute left-1/2 z-40 w-max max-w-64 -translate-x-1/2 border border-line bg-surface px-2 py-1 text-[12px] text-ink opacity-0 shadow-dropdown transition-opacity group-focus-within:opacity-100 group-hover:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  )
}
