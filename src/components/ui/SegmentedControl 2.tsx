import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from './utils'

export interface SegmentedOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: 'default' | 'compact'
  className?: string
  label?: string
}

const sizes: Record<NonNullable<SegmentedControlProps['size']>, string> = { default: 'h-8', compact: 'h-7' }

/**
 * Single-select value control rendered as a connected segment row. Unlike Tabs it
 * does not own content panels, so it uses radiogroup/radio semantics.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  size = 'default',
  className,
  label,
}: SegmentedControlProps) {
  const groupId = useId()
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const firstEnabled = useMemo(() => options.find((o) => !o.disabled)?.value ?? options[0]?.value, [options])
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled)
  const activeValue = value ?? internalValue

  const select = (next: string) => {
    setInternalValue(next)
    onValueChange?.(next)
  }

  const enabledIndexes = options.map((option, index) => ({ option, index })).filter(({ option }) => !option.disabled)

  const selectIndex = (index: number) => {
    const option = options[index]
    if (!option || option.disabled) return
    select(option.value)
    optionRefs.current[index]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const current = enabledIndexes.findIndex((item) => item.index === index)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = enabledIndexes[(current + 1 + enabledIndexes.length) % enabledIndexes.length]
      if (next) selectIndex(next.index)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const previous = enabledIndexes[(current - 1 + enabledIndexes.length) % enabledIndexes.length]
      if (previous) selectIndex(previous.index)
    } else if (event.key === 'Home') {
      event.preventDefault()
      if (enabledIndexes[0]) selectIndex(enabledIndexes[0].index)
    } else if (event.key === 'End') {
      event.preventDefault()
      const last = enabledIndexes[enabledIndexes.length - 1]
      if (last) selectIndex(last.index)
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex w-fit border border-line bg-surface', className)}>
      {options.map((option, index) => {
        const selected = option.value === activeValue
        return (
          <button
            key={option.value}
            ref={(node) => { optionRefs.current[index] = node }}
            id={`${groupId}-${option.value}`}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={option.disabled}
            onClick={() => select(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              'border-r border-line px-3 text-[13px] font-medium text-muted last:border-r-0 hover:bg-surface-2 hover:text-ink disabled:text-faint',
              sizes[size],
              selected && 'bg-accent-soft text-accent',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
