import type { ButtonHTMLAttributes } from 'react'
import { Button, type ButtonSize, type ButtonVariant } from './Button'
import { cx } from './utils'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Icon-only buttons have no visible text, so a label is required. */
  'aria-label': string
}

// Square overrides layered on top of Button's sizing (className wins, merged last).
const square: Record<ButtonSize, string> = { default: 'w-8 px-0', compact: 'h-7 w-7 px-0' }

export function IconButton({ variant = 'ghost', size = 'default', className, ...rest }: IconButtonProps) {
  return <Button variant={variant} size={size} className={cx(square[size], className)} {...rest} />
}
