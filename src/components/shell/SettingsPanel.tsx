import type { ReactNode } from 'react'

export interface SettingsPanelProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
}

export function SettingsPanel({ title, description, children }: SettingsPanelProps) {
  return (
    <aside className="grid gap-4 border border-line bg-surface p-4">
      <div className="grid gap-1 border-b border-line pb-3">
        <h2 className="display m-0 text-[16px] font-semibold text-ink">{title}</h2>
        {description && <p className="m-0 text-[14px] text-muted">{description}</p>}
      </div>
      {children}
    </aside>
  )
}
