import type { ReactNode } from 'react'
import { cx } from './utils'

export interface KbdProps {
  /** Render one chip per key (e.g. ['Ctrl', 'K']). Mutually exclusive with children. */
  keys?: readonly string[]
  children?: ReactNode
  className?: string
}

const chip =
  'num inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm border border-line bg-surface-2 px-1 text-[11px] text-muted'

/**
 * Keyboard-key chip for shortcut hints (command palette rows, tooltips, menu
 * items). Pass `keys` for multi-key combos or children for a single chip.
 */
export function Kbd({ keys, children, className }: KbdProps) {
  if (keys) {
    return (
      <span className={cx('inline-flex items-center gap-0.5', className)}>
        {keys.map((key) => (
          <kbd key={key} className={chip}>{key}</kbd>
        ))}
      </span>
    )
  }
  return <kbd className={cx(chip, className)}>{children}</kbd>
}
