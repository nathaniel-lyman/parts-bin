import type { ReactNode } from 'react'
import { cx } from '../ui/utils'

export interface NavigationItemProps {
  label: ReactNode
  href: string
  active?: boolean
  meta?: ReactNode
  collapsed?: boolean
  variant?: 'primary' | 'admin'
}

function NavigationItemBase({ label, href, active, meta, collapsed, variant = 'primary' }: NavigationItemProps) {
  const labelNode = <span className={cx('truncate', collapsed && 'sr-only')}>{label}</span>
  const adminClass = variant === 'admin' ? 'text-faint hover:text-ink' : 'text-muted hover:text-ink'

  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      title={collapsed && typeof label === 'string' ? label : undefined}
      className={cx(
        'flex h-8 items-center rounded-[2px] px-2 text-[13px] hover:bg-surface-2',
        collapsed ? 'justify-center' : 'justify-between',
        active ? 'bg-accent-soft text-accent' : adminClass,
      )}
    >
      {labelNode}
      {!collapsed && meta && <span className="num text-[11px]">{meta}</span>}
    </a>
  )
}

export function NavigationItem(props: NavigationItemProps) {
  if (props.active) return <ActiveNavigationItem {...props} />
  return <NavigationItemBase {...props} />
}

export function ActiveNavigationItem(props: Omit<NavigationItemProps, 'active'>) {
  return <NavigationItemBase {...props} active />
}
