import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../ui/utils'
import { SidebarCollapseIcon, SidebarExpandIcon } from './icons'

export interface CollapseSidebarControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  collapsed: boolean
}

export function CollapseSidebarControl({ collapsed, className, ...rest }: CollapseSidebarControlProps) {
  const Icon = collapsed ? SidebarExpandIcon : SidebarCollapseIcon
  return (
    <button
      type="button"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink',
        className,
      )}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
