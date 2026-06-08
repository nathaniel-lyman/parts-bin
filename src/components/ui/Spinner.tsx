import { cx } from './utils'

export type SpinnerSize = 'sm' | 'default' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  /** Accessible label. Pass an empty string to render a decorative spinner (e.g. inside a button that owns the busy state). */
  label?: string
  className?: string
}

const sizes: Record<SpinnerSize, string> = {
  sm: 'h-3.5 w-3.5 border-2',
  default: 'h-4 w-4 border-2',
  lg: 'h-6 w-6 border-[3px]',
}

export function Spinner({ size = 'default', label = 'Loading', className }: SpinnerProps) {
  const decorative = label === ''
  return (
    <span
      role={decorative ? undefined : 'status'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cx('inline-block', className)}
    >
      {/* border-current inherits the parent's text-color token; the transparent top edge makes the gap. */}
      <span className={cx('block animate-spin rounded-full border-current border-t-transparent', sizes[size])} aria-hidden="true" />
    </span>
  )
}
