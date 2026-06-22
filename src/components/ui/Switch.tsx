import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from './utils'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  hint?: ReactNode
}

const switchRadiusClass = 'rounded-sm'

export function Switch({ label, hint, className, ...rest }: SwitchProps) {
  return (
    <label className={cx('inline-flex items-center gap-2 text-[14px] text-ink', className)}>
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...rest}
        />
        <span className={cx('pointer-events-none absolute inset-0 border border-line bg-surface-2 transition-colors peer-checked:border-accent peer-checked:bg-accent peer-disabled:opacity-50', switchRadiusClass)} />
        <span className={cx('pointer-events-none absolute left-0.5 h-4 w-4 border border-line bg-surface transition-transform peer-checked:translate-x-4', switchRadiusClass)} />
      </span>
      {(label || hint) && (
        <span className="grid gap-0.5">
          {label && <span>{label}</span>}
          {hint && <span className="text-[12px] text-muted">{hint}</span>}
        </span>
      )}
    </label>
  )
}
