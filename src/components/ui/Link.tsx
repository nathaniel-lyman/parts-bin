import type { AnchorHTMLAttributes } from 'react'
import { cx } from './utils'

export type LinkVariant = 'accent' | 'muted'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant
  /** Opens in a new tab with rel="noreferrer". */
  external?: boolean
}

const variants: Record<LinkVariant, string> = {
  accent: 'text-accent hover:opacity-80',
  muted: 'text-muted hover:text-ink',
}

export function Link({ variant = 'accent', external = false, className, children, ...rest }: LinkProps) {
  return (
    <a
      {...(external ? { target: '_blank', rel: 'noreferrer' } : undefined)}
      className={cx(
        'underline underline-offset-2 transition-[color,opacity] duration-[var(--motion-moderate-01)] ease-[var(--ease-productive)]',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  )
}
