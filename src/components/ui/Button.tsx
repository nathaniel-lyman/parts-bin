import type { ButtonHTMLAttributes } from 'react'
import { cx } from './utils'

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
}

export function Button({ variant = 'secondary', size = 'default', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-[2px] text-[13px] font-medium transition-[background,opacity] duration-150 ease-out disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
}
