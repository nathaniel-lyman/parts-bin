import type { ButtonHTMLAttributes } from 'react'
import { cx } from './utils'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'default' | 'compact'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  destructive: 'bg-transparent text-neg border border-neg hover:bg-neg-soft',
}
const sizes: Record<ButtonSize, string> = { default: 'h-8 px-3', compact: 'h-7 px-2' }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({ variant = 'secondary', size = 'default', loading = false, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm text-[13px] font-medium transition-[background,opacity] duration-[var(--motion-moderate-01)] ease-[var(--ease-productive)] disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="sm" label="" />}
      {children}
    </button>
  )
}
