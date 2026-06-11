import type { ReactNode } from 'react'

export interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div className="grid gap-1">
        <h2 className="display m-0 text-[16px] font-semibold text-ink">{title}</h2>
        {description && <p className="m-0 text-[13px] text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
