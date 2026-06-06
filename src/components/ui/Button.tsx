import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'default' | 'compact'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  destructive: 'bg-transparent text-neg border border-neg hover:bg-neg-soft',
}
const sizes: Record<Size, string> = { default: 'h-8 px-3', compact: 'h-7 px-2' }

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'secondary', size = 'default', className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[2px] text-[13px] font-medium transition-[background,opacity] duration-150 ease-out disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  )
}
