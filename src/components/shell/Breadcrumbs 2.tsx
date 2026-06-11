import type { ReactNode } from 'react'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-muted">
      {items.map((item, index) => (
        <span key={index} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-faint">/</span>}
          {item.href ? (
            <a className="hover:text-ink" href={item.href}>
              {item.label}
            </a>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
