import type { ReactNode } from 'react'
import { cx } from './utils'

export interface DetailHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  status?: ReactNode
  actions?: ReactNode
  className?: string
}

export function DetailHeader({ title, subtitle, meta, status, actions, className }: DetailHeaderProps) {
  return (
    <header className={cx('flex min-w-0 flex-col gap-3 border-b border-line bg-surface px-4 py-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="grid min-w-0 gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="m-0 text-[24px] font-semibold leading-tight text-ink">{title}</h1>
          {status}
        </div>
        {subtitle && <p className="m-0 text-[14px] text-muted">{subtitle}</p>}
        {meta && <div className="flex flex-wrap items-center gap-2 text-[12px] text-faint">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export interface DetailField {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
}

export interface KeyValueListProps {
  items: DetailField[]
  className?: string
}

export function KeyValueList({ items, className }: KeyValueListProps) {
  return (
    <dl className={cx('m-0 grid gap-0 border border-line bg-surface', className)}>
      {items.map((item, index) => (
        <div key={index} className="grid gap-1 border-b border-line px-3 py-2 last:border-b-0 sm:grid-cols-[11rem_1fr]">
          <dt className="micro text-muted">{item.label}</dt>
          <dd className="m-0 min-w-0 text-[14px] text-ink">
            {item.value}
            {item.description && <div className="mt-1 text-[12px] text-muted">{item.description}</div>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export interface DescriptionListProps extends KeyValueListProps {
  columns?: 1 | 2 | 3
}

const descriptionColumns: Record<NonNullable<DescriptionListProps['columns']>, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
}

export function DescriptionList({ items, columns = 2, className }: DescriptionListProps) {
  return (
    <dl className={cx('m-0 grid gap-3', descriptionColumns[columns], className)}>
      {items.map((item, index) => (
        <div key={index} className="grid gap-1 border border-line bg-surface px-3 py-2">
          <dt className="micro text-muted">{item.label}</dt>
          <dd className="m-0 min-w-0 text-[14px] text-ink">{item.value}</dd>
          {item.description && <dd className="m-0 text-[12px] text-muted">{item.description}</dd>}
        </div>
      ))}
    </dl>
  )
}

export type PropertyGridProps = DescriptionListProps

export function PropertyGrid({ items, columns = 3, className }: PropertyGridProps) {
  return <DescriptionList items={items} columns={columns} className={className} />
}

export interface MetadataPanelProps {
  title?: ReactNode
  items: DetailField[]
  footer?: ReactNode
  className?: string
}

export function MetadataPanel({ title = 'Metadata', items, footer, className }: MetadataPanelProps) {
  return (
    <aside className={cx('min-w-0 border border-line bg-surface', className)}>
      {title && <div className="micro border-b border-line px-3 py-2">{title}</div>}
      <KeyValueList items={items} className="border-0" />
      {footer && <div className="border-t border-line px-3 py-2 text-[12px] text-muted">{footer}</div>}
    </aside>
  )
}
