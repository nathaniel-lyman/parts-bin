import type { ReactNode } from 'react'

export interface AppShellProps {
  sidebar?: ReactNode
  topNav?: ReactNode
  children: ReactNode
}

export function AppShell({ sidebar, topNav, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="flex min-h-screen">
        {sidebar}
        <div className="min-w-0 flex-1">
          {topNav}
          {children}
        </div>
      </div>
    </div>
  )
}
