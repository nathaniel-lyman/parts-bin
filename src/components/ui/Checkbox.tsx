import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from './utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  hint?: ReactNode
}

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  const control = (
    <input
      type="checkbox"
      className={cx('h-4 w-4 shrink-0 accent-accent disabled:opacity-50', className)}
      {...rest}
    />
  )

  if (!label) return control

  return (
    <label className="flex items-start gap-2 text-[14px] text-ink">
      {control}
      <span className="grid gap-0.5">
        <span>{label}</span>
        {hint && <span className="text-[12px] text-muted">{hint}</span>}
      </span>
    </label>
  )
}
