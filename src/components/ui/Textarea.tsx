import type { TextareaHTMLAttributes } from 'react'
import { cx } from './utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cx(
        'min-h-24 w-full resize-y rounded-sm border border-line bg-surface px-2 py-2 text-[14px] text-ink placeholder:text-faint focus:border-accent disabled:bg-surface-2 disabled:text-faint',
        className,
      )}
      {...rest}
    />
  )
}
