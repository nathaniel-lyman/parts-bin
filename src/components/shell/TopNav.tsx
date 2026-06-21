import type { ReactNode } from 'react'
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'

export interface TopNavProps {
  breadcrumbs?: BreadcrumbItem[]
  title?: ReactNode
  actions?: ReactNode
}

export function TopNav({ breadcrumbs, title, actions }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center gap-4 border-b border-line bg-surface px-4 py-2">
      <div className="min-w-0">
        {breadcrumbs && (
          // Redundant with the title on phones — hide to keep the bar one row.
          <div className={title ? 'hidden sm:block' : undefined}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {title && <div className="display truncate text-[15px] font-semibold text-ink">{title}</div>}
      </div>
      {/* nowrap: secondary controls hide at breakpoints rather than wrapping the bar onto a second row. */}
      {actions && <div className="ml-auto flex flex-nowrap items-center justify-end gap-2">{actions}</div>}
    </header>
  )
}
