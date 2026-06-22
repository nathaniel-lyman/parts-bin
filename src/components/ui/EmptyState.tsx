import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  glyph?: ReactNode
}

export function EmptyState({ title, description, action, glyph = '[]' }: EmptyStateProps) {
  return (
    <div className="grid place-items-center gap-3 border border-line bg-surface px-4 py-10 text-center">
      <div className="num text-[22px] text-faint">{glyph}</div>
      <div className="grid gap-1">
        <h3 className="m-0 text-[14px] font-semibold text-ink">{title}</h3>
        {description && <p className="m-0 max-w-md text-[14px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
