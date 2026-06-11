import type { ReactNode } from 'react'

export interface PageTitleProps {
  children: ReactNode
}

export function PageTitle({ children }: PageTitleProps) {
  return <h1 className="display m-0 text-[28px] font-semibold leading-tight text-ink">{children}</h1>
}

export interface PageSubtitleProps {
  children: ReactNode
}

export function PageSubtitle({ children }: PageSubtitleProps) {
  return <p className="m-0 max-w-2xl text-[13px] text-muted">{children}</p>
}

export interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1">
        {eyebrow && <div className="micro">{eyebrow}</div>}
        <PageTitle>{title}</PageTitle>
        {description && <PageSubtitle>{description}</PageSubtitle>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
