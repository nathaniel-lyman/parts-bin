import type { ReactNode } from 'react'
import { cx } from '../ui/utils'
import { AdminNavigationItem } from './AdminNavigationItem'
import { AdminSectionDivider } from './AdminSectionDivider'
import { BrandLockup } from './BrandLockup'
import { CollapseSidebarControl } from './CollapseSidebarControl'
import { NavigationItem, type NavigationItemProps } from './NavigationItem'

export type DrawerNavigationItem = Omit<NavigationItemProps, 'collapsed' | 'variant'>

export interface LeftNavigationDrawerProps {
  brand: ReactNode
  brandHref?: string
  brandMark?: ReactNode
  items: DrawerNavigationItem[]
  adminItems?: DrawerNavigationItem[]
  footer?: ReactNode
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function LeftNavigationDrawer({
  brand,
  brandHref,
  brandMark,
  items,
  adminItems = [],
  footer,
  collapsed = false,
  onCollapsedChange,
}: LeftNavigationDrawerProps) {
  return (
    <aside
      className={cx(
        'hidden min-h-screen shrink-0 border-r border-line bg-surface lg:flex lg:flex-col',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      <div className="border-b border-line px-3 py-3">
        <BrandLockup href={brandHref} mark={brandMark} collapsed={collapsed}>
          {brand}
        </BrandLockup>
      </div>
      <nav className="grid gap-1 p-2" aria-label="Primary">
        {items.map((item) => (
          <NavigationItem key={String(item.label)} {...item} collapsed={collapsed} />
        ))}
        {adminItems.length > 0 && (
          <>
            <AdminSectionDivider collapsed={collapsed} />
            {adminItems.map((item) => (
              <AdminNavigationItem key={String(item.label)} {...item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>
      <div className="mt-auto border-t border-line p-3">
        <div className={cx('flex items-center gap-2', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && footer && <div className="min-w-0">{footer}</div>}
          {onCollapsedChange && (
            <CollapseSidebarControl collapsed={collapsed} onClick={() => onCollapsedChange(!collapsed)} />
          )}
        </div>
      </div>
    </aside>
  )
}
