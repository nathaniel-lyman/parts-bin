import type { ReactNode } from 'react'
import { cx } from './utils'

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline'
export type AvatarSize = 'sm' | 'md' | 'lg'

const avatarSizes: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[12px]',
  md: 'h-8 w-8 text-[12px]',
  lg: 'h-10 w-10 text-[14px]',
}

const presenceClasses: Record<PresenceStatus, string> = {
  online: 'bg-pos',
  away: 'bg-warn',
  busy: 'bg-neg',
  offline: 'bg-faint',
}

export interface AvatarProps {
  name: string
  src?: string
  initials?: string
  size?: AvatarSize
  status?: PresenceStatus
  className?: string
}

export function Avatar({ name, src, initials, size = 'md', status, className }: AvatarProps) {
  const fallback = initials ?? name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className={cx('relative inline-grid shrink-0 place-items-center rounded-sm border border-line bg-surface-2 font-semibold text-ink', avatarSizes[size], className)}>
      {src ? <img src={src} alt="" className="h-full w-full rounded-sm object-cover" /> : <span aria-hidden="true">{fallback}</span>}
      <span className="sr-only">{name}</span>
      {status && <PresenceBadge status={status} className="absolute -bottom-0.5 -right-0.5" />}
    </span>
  )
}

export interface PresenceBadgeProps {
  status: PresenceStatus
  className?: string
}

export function PresenceBadge({ status, className }: PresenceBadgeProps) {
  return (
    <span className={cx('inline-flex h-2.5 w-2.5 rounded-full border border-surface', presenceClasses[status], className)}>
      <span className="sr-only">{status}</span>
    </span>
  )
}

export interface AvatarGroupProps {
  users: AvatarProps[]
  max?: number
  size?: AvatarSize
  className?: string
}

export function AvatarGroup({ users, max = 4, size = 'md', className }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max)
  const overflow = Math.max(0, users.length - visibleUsers.length)

  return (
    <div className={cx('flex items-center', className)} aria-label={`${users.length} people`}>
      {visibleUsers.map((user) => (
        <Avatar key={user.name} {...user} size={size} className="-ml-1 first:ml-0" />
      ))}
      {overflow > 0 && (
        <span className={cx('-ml-1 inline-grid shrink-0 place-items-center rounded-sm border border-line bg-surface text-muted', avatarSizes[size])}>
          +{overflow}
        </span>
      )}
    </div>
  )
}

export interface AssigneeChipProps {
  name: string
  src?: string
  status?: PresenceStatus
  meta?: ReactNode
  onRemove?: () => void
}

export function AssigneeChip({ name, src, status, meta, onRemove }: AssigneeChipProps) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-sm border border-line bg-surface px-2 py-1 text-[14px] text-ink">
      <Avatar name={name} src={src} status={status} size="sm" />
      <span className="min-w-0 truncate font-medium">{name}</span>
      {meta && <span className="text-[12px] text-muted">{meta}</span>}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="text-faint hover:text-ink">
          x
        </button>
      )}
    </span>
  )
}
