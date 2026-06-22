import { useId, useState, type ReactNode } from 'react'
import { cx } from './utils'

export interface RadioOption {
  value: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  className?: string
}

/**
 * Classic form radio list built on native <input type="radio"> (free arrow-key
 * navigation, focus, and form participation). For the compact connected-toggle
 * look use SegmentedControl instead. Carries its own group label/hint/error,
 * so it is used standalone rather than wrapped by Field.
 */
export function RadioGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  label,
  hint,
  error,
  orientation = 'vertical',
  disabled = false,
  className,
}: RadioGroupProps) {
  const groupId = useId()
  const nameAttr = name ?? groupId
  const [internalValue, setInternalValue] = useState(defaultValue)
  const current = value ?? internalValue

  const select = (next: string) => {
    setInternalValue(next)
    onValueChange?.(next)
  }

  const labelId = label ? `${groupId}-label` : undefined
  const hintId = hint && !error ? `${groupId}-hint` : undefined
  const errorId = error ? `${groupId}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cx('grid gap-1.5', className)}>
      {label && <span id={labelId} className="micro">{label}</span>}
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cx('grid gap-2', orientation === 'horizontal' && 'sm:auto-cols-max sm:grid-flow-col sm:gap-4')}
      >
        {options.map((option) => {
          const optionDisabled = disabled || option.disabled
          return (
            <label
              key={option.value}
              className={cx('flex items-start gap-2 text-[14px] text-ink', optionDisabled && 'opacity-60')}
            >
              <input
                type="radio"
                name={nameAttr}
                value={option.value}
                checked={current === option.value}
                disabled={optionDisabled}
                onChange={() => select(option.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent disabled:opacity-50"
              />
              <span className="grid gap-0.5">
                <span>{option.label}</span>
                {option.description && <span className="text-[12px] text-muted">{option.description}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {hint && !error && <p id={hintId} className="m-0 text-[12px] text-muted">{hint}</p>}
      {error && <p id={errorId} className="m-0 text-[12px] font-medium text-neg">{error}</p>}
    </div>
  )
}
