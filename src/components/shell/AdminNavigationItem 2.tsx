import type { NavigationItemProps } from './NavigationItem'
import { NavigationItem } from './NavigationItem'

export type AdminNavigationItemProps = Omit<NavigationItemProps, 'variant'>

export function AdminNavigationItem(props: AdminNavigationItemProps) {
  return <NavigationItem {...props} variant="admin" />
}
