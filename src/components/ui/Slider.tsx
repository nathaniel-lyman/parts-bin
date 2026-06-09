import { useId, useState, type ReactNode } from 'react'
import { cx } from './utils'

export interface SliderProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Visible caption above the track; also labels the slider. */
  label?: ReactNode
  /** Show the current value to the right of the caption row. */
  showValue?: boolean
  formatValue?: (value: number) => string
  disabled?: boolean
  id?: string
  className?: string
  // Injected by Field (cloneElement) onto the focusable input.
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
}

/**
 * Range input themed via the accent token (native control, so keyboard and
 * screen-reader semantics come for free). Use NumberInput-style fields when
 * the exact value matters more than the gesture.
 */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  formatValue = (v) => String(v),
  disabled = false,
  id,
  className,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
}: SliderProps) {
  const generatedId = useId()
  const sliderId = id ?? generatedId
  const [internalValue, setInternalValue] = useState(defaultValue ?? min)
  const current = value ?? internalValue

  return (
    <div className={cx('grid w-full gap-1', className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && <label htmlFor={sliderId} className="text-[12px] font-medium text-ink">{label}</label>}
          {showValue && <span className="num text-[12px] text-muted">{formatValue(current)}</span>}
        </div>
      )}
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        aria-label={label ? undefined : ariaLabel}
        onChange={(event) => {
          const next = Number(event.target.value)
          setInternalValue(next)
          onValueChange?.(next)
        }}
        style={{ accentColor: 'var(--accent)' }}
        className="h-1.5 w-full cursor-pointer appearance-auto disabled:cursor-default disabled:opacity-50"
      />
    </div>
  )
}
