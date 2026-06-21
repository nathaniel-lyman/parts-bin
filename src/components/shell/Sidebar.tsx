import type { ReactNode } from 'react'
import { LeftNavigationDrawer, type SidebarResizeConfig } from './LeftNavigationDrawer'

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
  resizable?: boolean | SidebarResizeConfig
}

export function Sidebar({ brand, items, footer, resizable }: SidebarProps) {
  return <LeftNavigationDrawer brand={brand} items={items} footer={footer} resizable={resizable} />
}
