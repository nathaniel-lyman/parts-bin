import type { ReactNode } from 'react'
import { EmptyState } from '../ui/EmptyState'
import { cx } from '../ui/utils'

export interface ChartCardProps {
  title: ReactNode
  description?: ReactNode
  metric?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({ title, description, metric, actions, children, className }: ChartCardProps) {
  return (
    <section className={cx('min-w-0 border border-line bg-surface', className)}>
      <header className="flex min-w-0 items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="grid min-w-0 gap-1">
          <h2 className="micro m-0">{title}</h2>
          {description && <p className="m-0 text-[12px] text-muted">{description}</p>}
        </div>
        {(metric || actions) && (
          <div className="flex shrink-0 items-center gap-2">
            {metric && <div className="num text-[18px] font-semibold text-ink">{metric}</div>}
            {actions}
          </div>
        )}
      </header>
      <div className="min-w-0 p-4">{children}</div>
    </section>
  )
}

export interface ChartLegendItem {
  id: string
  label: ReactNode
  colorClassName?: string
  value?: ReactNode
}

export interface ChartLegendProps {
  items: ChartLegendItem[]
  className?: string
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <ul className={cx('m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0', className)}>
      {items.map((item) => (
        <li key={item.id} className="inline-flex items-center gap-1.5 text-[12px] text-muted">
          <span className={cx('h-2 w-2 rounded-[2px] bg-accent', item.colorClassName)} aria-hidden="true" />
          <span>{item.label}</span>
          {item.value && <span className="num text-ink">{item.value}</span>}
        </li>
      ))}
    </ul>
  )
}

export interface ChartTooltipRow {
  label: ReactNode
  value: ReactNode
  colorClassName?: string
}

export interface ChartTooltipContentProps {
  label?: ReactNode
  rows: ChartTooltipRow[]
  footer?: ReactNode
}

export function ChartTooltipContent({ label, rows, footer }: ChartTooltipContentProps) {
  return (
    <div className="grid min-w-40 gap-2 border border-line bg-surface p-2 text-[12px] text-ink shadow-dropdown">
      {label && <div className="micro text-muted">{label}</div>}
      <div className="grid gap-1">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
              <span className={cx('h-2 w-2 rounded-[2px] bg-accent', row.colorClassName)} aria-hidden="true" />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="num font-semibold text-ink">{row.value}</span>
          </div>
        ))}
      </div>
      {footer && <div className="border-t border-line pt-2 text-muted">{footer}</div>}
    </div>
  )
}

export interface ChartEmptyStateProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function ChartEmptyState({ title = 'No chart data', description = 'Adjust filters or add data to render this chart.', action }: ChartEmptyStateProps) {
  return <EmptyState title={title} description={description} action={action} glyph="chart" />
}
