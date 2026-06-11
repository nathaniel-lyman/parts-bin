import { cx } from './utils'

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** Decorative rules (default) are hidden from assistive tech; set false for a semantic separator. */
  decorative?: boolean
  className?: string
}

export function Separator({ orientation = 'horizontal', decorative = true, className }: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      className={cx(
        'shrink-0 bg-line',
        orientation === 'horizontal' ? 'h-px w-full' : 'min-h-4 w-px self-stretch',
        className,
      )}
    />
  )
}
