import type { ReactNode } from 'react'

export interface CardProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Card({ title, description, actions, children, footer }: CardProps) {
  return (
    <section className="min-w-0 rounded-[2px] border border-line bg-surface">
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="grid min-w-0 gap-1">
            {title && <h2 className="micro m-0">{title}</h2>}
            {description && <p className="m-0 text-[12px] text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="min-w-0 p-4">{children}</div>
      {footer && <div className="border-t border-line px-4 py-3">{footer}</div>}
    </section>
  )
}
