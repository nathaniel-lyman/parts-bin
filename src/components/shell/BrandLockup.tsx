import type { ReactNode } from 'react'
import { cx } from '../ui/utils'

export interface BrandLockupProps {
  children: ReactNode
  href?: string
  collapsed?: boolean
  mark?: ReactNode
}

export function BrandLockup({ children, href = '/', collapsed = false, mark }: BrandLockupProps) {
  return (
    <a
      className={cx(
        'display flex h-9 min-w-0 items-center gap-2 text-[15px] font-bold text-ink',
        collapsed && 'justify-center',
      )}
      href={href}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-line bg-surface-2 text-[14px]">
        {mark ?? '#'}
      </span>
      <span className={cx('truncate', collapsed && 'sr-only')}>{children}</span>
    </a>
  )
}
