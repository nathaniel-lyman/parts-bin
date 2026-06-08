import type { ReactNode } from 'react'
import { cx } from './utils'

export type EventTone = 'neutral' | 'positive' | 'warning' | 'negative' | 'accent'

const toneClasses: Record<EventTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  positive: 'bg-pos-soft text-pos',
  warning: 'bg-warn-soft text-warn',
  negative: 'bg-neg-soft text-neg',
  accent: 'bg-accent-soft text-accent',
}

export interface ActivityEvent {
  id: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actor?: ReactNode
  timestamp?: ReactNode
  tone?: EventTone
  icon?: ReactNode
  actions?: ReactNode
}

export interface EventRowProps extends ActivityEvent {
  className?: string
}

export function EventRow({
  title,
  description,
  meta,
  actor,
  timestamp,
  tone = 'neutral',
  icon,
  actions,
  className,
}: EventRowProps) {
  return (
    <article className={cx('grid gap-2 border-b border-line px-3 py-3 last:border-b-0 sm:grid-cols-[auto_1fr_auto]', className)}>
      <div className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-[2px] text-[13px] font-semibold', toneClasses[tone])} aria-hidden="true">
        {icon ?? title?.toString().slice(0, 1)}
      </div>
      <div className="grid min-w-0 gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="m-0 text-[13px] font-semibold text-ink">{title}</h3>
          {actor && <span className="text-[12px] text-muted">{actor}</span>}
        </div>
        {description && <p className="m-0 text-[13px] text-muted">{description}</p>}
        {meta && <div className="text-[12px] text-faint">{meta}</div>}
      </div>
      {(timestamp || actions) && (
        <div className="flex shrink-0 items-center gap-2 text-[12px] text-muted sm:justify-end">
          {timestamp}
          {actions}
        </div>
      )}
    </article>
  )
}

export interface ActivityFeedProps {
  items: ActivityEvent[]
  title?: ReactNode
  emptyState?: ReactNode
  className?: string
}

export function ActivityFeed({ items, title, emptyState = 'No activity yet', className }: ActivityFeedProps) {
  return (
    <section className={cx('min-w-0 border border-line bg-surface', className)}>
      {title && <div className="micro border-b border-line px-3 py-2">{title}</div>}
      {items.length > 0 ? items.map((item) => <EventRow key={item.id} {...item} />) : (
        <p className="m-0 px-3 py-8 text-center text-[13px] text-muted">{emptyState}</p>
      )}
    </section>
  )
}

export interface TimelineProps {
  items: ActivityEvent[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cx('m-0 grid list-none gap-0 border border-line bg-surface p-0', className)}>
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[2rem_1fr] gap-3 px-3 py-3">
          <div className="grid justify-items-center">
            <span className={cx('grid h-7 w-7 place-items-center rounded-[2px] text-[12px] font-semibold', toneClasses[item.tone ?? 'neutral'])} aria-hidden="true">
              {item.icon ?? item.title?.toString().slice(0, 1)}
            </span>
            <span className="mt-2 min-h-5 w-px flex-1 bg-line" aria-hidden="true" />
          </div>
          <div className="min-w-0 pb-3">
            <EventRow {...item} className="border-b-0 px-0 py-0" />
          </div>
        </li>
      ))}
    </ol>
  )
}

export interface AuditLogItemProps extends ActivityEvent {
  resource?: ReactNode
}

export function AuditLogItem({ resource, meta, ...item }: AuditLogItemProps) {
  return (
    <EventRow
      {...item}
      meta={(
        <span className="flex flex-wrap items-center gap-2">
          {resource && <span className="font-medium text-muted">{resource}</span>}
          {meta && <span>{meta}</span>}
        </span>
      )}
    />
  )
}
