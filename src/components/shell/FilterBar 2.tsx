import type { ReactNode } from 'react'

export interface FilterBarProps {
  children?: ReactNode
  actions?: ReactNode
}

export function FilterBar({ children, actions }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-line bg-surface px-3 py-2">
      {children}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
