import type { InputHTMLAttributes } from 'react'
import { cx, hasWidthUtility } from './utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cx(
        'h-8 bg-surface text-ink border border-line rounded-sm px-2 text-[14px] placeholder:text-faint focus:border-accent disabled:bg-surface-2 disabled:text-faint',
        !hasWidthUtility(className) && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}
