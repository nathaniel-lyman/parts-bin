import type { ButtonHTMLAttributes } from 'react'
import { Button, type ButtonSize, type ButtonVariant } from './Button'
import { cx } from './utils'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Icon-only buttons have no visible text, so a label is required. */
  'aria-label': string
}

// Square overrides layered on top of Button's sizing (className wins, merged last).
const square: Record<ButtonSize, string> = { default: 'w-8 px-0', compact: 'h-7 w-7 px-0' }

export function IconButton({ variant = 'ghost', size = 'default', loading = false, className, children, ...rest }: IconButtonProps) {
  // Button renders the spinner (and owns aria-busy/disabled) when loading; hide the icon so only the spinner shows.
  return (
    <Button variant={variant} size={size} loading={loading} className={cx(square[size], className)} {...rest}>
      {loading ? null : children}
    </Button>
  )
}
