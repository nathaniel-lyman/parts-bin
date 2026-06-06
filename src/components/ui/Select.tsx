import type { SelectHTMLAttributes } from 'react'
export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-8 w-full bg-surface text-ink border border-line rounded-[2px] px-2 text-[13px] focus:border-accent ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}
