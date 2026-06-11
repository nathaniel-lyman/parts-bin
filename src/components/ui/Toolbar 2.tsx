import type { ReactNode } from 'react'

export interface ToolbarProps {
  children?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
}

export function Toolbar({ children, leading, trailing }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-line bg-surface px-3 py-2">
      {leading}
      {children}
      {trailing && <div className="ml-auto flex flex-wrap items-center gap-2">{trailing}</div>}
    </div>
  )
}
