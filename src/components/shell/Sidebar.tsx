import type { ReactNode } from 'react'
import { LeftNavigationDrawer } from './LeftNavigationDrawer'

export interface SidebarNavItem {
  label: ReactNode
  href: string
  active?: boolean
  meta?: ReactNode
}

export interface SidebarProps {
  brand: ReactNode
  items: SidebarNavItem[]
  footer?: ReactNode
}

export function Sidebar({ brand, items, footer }: SidebarProps) {
  return <LeftNavigationDrawer brand={brand} items={items} footer={footer} />
}
