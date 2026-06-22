import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx, hasWidthUtility } from './utils'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <span className={cx('relative inline-flex', !hasWidthUtility(className) && 'w-full')}>
      <select
        className={cx(
          'peer h-8 appearance-none bg-surface text-ink border border-line rounded-sm pl-2 pr-7 text-[14px] focus:border-accent disabled:bg-surface-2 disabled:text-faint',
          !hasWidthUtility(className) && 'w-full',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {/* appearance-none above suppresses the OS arrow, which ignores the theme */}
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted peer-disabled:text-faint"
        strokeWidth={1.8}
      />
    </span>
  )
}
