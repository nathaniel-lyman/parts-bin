import type { InputHTMLAttributes, ReactNode } from 'react'
import { Button } from '../ui/Button'
import { DropdownMenu, type DropdownMenuItem } from '../ui/DropdownMenu'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { cx, hasWidthUtility } from '../ui/utils'
import { BellGlyph, CalendarGlyph, FilterGlyph } from './icons'

export interface TimePeriodOption {
  value: string
  label: string
}

export interface TimePeriodSelectorProps {
  value: string
  options: TimePeriodOption[]
  onChange: (value: string) => void
  label?: string
}

export function TimePeriodSelector({ value, options, onChange, label = 'Time period' }: TimePeriodSelectorProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <Select
        className="w-[132px]"
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </label>
  )
}

export interface GlobalControlButtonProps {
  label: string
  onClick?: () => void
  pressed?: boolean
  className?: string
}

export function CalendarIconButton({ label, onClick, className }: GlobalControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      <CalendarGlyph className="h-4 w-4" />
    </button>
  )
}

export function FilterButton({ label, pressed = false, onClick, className }: GlobalControlButtonProps) {
  return (
    <Button
      size="compact"
      variant={pressed ? 'primary' : 'secondary'}
      aria-pressed={pressed}
      onClick={onClick}
      className={cx('gap-1.5', className)}
    >
      <FilterGlyph className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

export type GlobalSearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function GlobalSearchInput({ className, ...rest }: GlobalSearchInputProps) {
  return (
    <Input
      type="search"
      className={cx(!hasWidthUtility(className) && 'w-[220px]', className)}
      {...rest}
    />
  )
}

export interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null
  const label = count > 9 ? '9+' : String(count)
  return (
    <span className="num absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neg px-1 text-[10px] leading-none text-neg-fg">
      {label}
    </span>
  )
}

export interface NotificationButtonProps {
  count?: number
  onClick?: () => void
}

export function NotificationButton({ count = 0, onClick }: NotificationButtonProps) {
  return (
    <button
      type="button"
      aria-label={count > 0 ? `${count} notifications` : 'Notifications'}
      title="Notifications"
      onClick={onClick}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink"
    >
      <BellGlyph className="h-4 w-4" />
      <NotificationBadge count={count} />
    </button>
  )
}

export interface UserAvatarMenuProps {
  name: string
  initials: string
  items?: DropdownMenuItem[]
  meta?: ReactNode
}

export function UserAvatarMenu({ name, initials, items, meta }: UserAvatarMenuProps) {
  const menuItems = items ?? [
    { id: 'profile', label: 'Profile', description: name },
    { id: 'settings', label: 'Settings', description: meta },
    { id: 'sign-out', label: 'Sign out' },
  ]

  return (
    <DropdownMenu
      align="end"
      label={
        <span className="flex items-center gap-2">
          <span className="num flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-[11px] text-accent">
            {initials}
          </span>
          <span className="hidden max-w-[96px] truncate sm:inline">{name}</span>
        </span>
      }
      items={menuItems}
    />
  )
}
