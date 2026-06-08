import type { SelectHTMLAttributes } from 'react'
import { cx, hasWidthUtility } from './utils'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select
      className={cx(
        'h-8 bg-surface text-ink border border-line rounded-[2px] px-2 text-[13px] focus:border-accent disabled:bg-surface-2 disabled:text-faint',
        !hasWidthUtility(className) && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}
