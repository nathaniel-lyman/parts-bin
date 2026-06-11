import type { ReactNode } from 'react'
import { cx } from '../ui/utils'

export interface AdminSectionDividerProps {
  label?: ReactNode
  collapsed?: boolean
}

export function AdminSectionDivider({ label = 'Admin', collapsed = false }: AdminSectionDividerProps) {
  return (
    <div className={cx('mt-3 border-t border-line pt-3', collapsed && 'px-1')}>
      <div className={cx('micro px-2 pb-1 text-faint', collapsed && 'sr-only')}>{label}</div>
    </div>
  )
}
