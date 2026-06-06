import type { InputHTMLAttributes } from 'react'
export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-8 w-full bg-surface text-ink border border-line rounded-[2px] px-2 text-[13px] placeholder:text-faint focus:border-accent ${className}`}
      {...rest}
    />
  )
}
