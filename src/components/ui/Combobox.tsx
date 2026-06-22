import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAnchoredPosition } from './useAnchoredPosition'
import { cx, hasWidthUtility } from './utils'

export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  emptyMessage?: string
  // Injected by Field (cloneElement) onto the focusable input.
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  required?: boolean
}

/**
 * Single-select, type-to-filter combobox following the WAI-ARIA combobox +
 * listbox pattern: focus stays on the input and the active option is tracked
 * via aria-activedescendant. Strict select-from-list (no free-text values).
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled = false,
  id,
  className,
  emptyMessage = 'No matches',
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  required,
}: ComboboxProps) {
  const generatedId = useId()
  const comboId = id ?? generatedId
  const listboxId = `${comboId}-listbox`

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [internalValue, setInternalValue] = useState(defaultValue)
  const selectedValue = value ?? internalValue
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? null,
    [options, selectedValue],
  )

  // `query` is the text the user types while the menu is open. While closed, the
  // input shows the selected option's label (derived — no effect needed, and it
  // tracks controlled value changes from the parent for free).
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const displayValue = open ? query : (selectedOption?.label ?? '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '' || (selectedOption && query === selectedOption.label)) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query, selectedOption])

  const clampedActive = activeIndex < filtered.length ? activeIndex : 0
  // gap 4 matches the mt-1 the list had before it moved to a portal.
  const listStyle = useAnchoredPosition(open, containerRef, listRef, { gap: 4, matchWidth: true })

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (containerRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Seed the query with the current selection so opening shows the full list and
  // the active selection; guard so re-entry while open doesn't wipe typed text.
  const openMenu = () => {
    if (open) return
    setQuery(selectedOption?.label ?? '')
    setActiveIndex(0)
    setOpen(true)
  }

  const select = (option: ComboboxOption) => {
    if (option.disabled) return
    setInternalValue(option.value)
    onValueChange?.(option.value)
    setOpen(false)
  }

  const moveActive = (delta: number) => {
    if (filtered.length === 0) return
    let next = clampedActive
    for (let i = 0; i < filtered.length; i += 1) {
      next = (next + delta + filtered.length) % filtered.length
      if (!filtered[next]?.disabled) break
    }
    setActiveIndex(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) { openMenu(); return }
      moveActive(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) { openMenu(); return }
      moveActive(-1)
    } else if (event.key === 'Enter') {
      if (open && filtered[clampedActive]) {
        event.preventDefault()
        select(filtered[clampedActive])
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        setOpen(false)
      }
    }
  }

  const activeId = open && filtered[clampedActive] ? `${listboxId}-opt-${clampedActive}` : undefined

  return (
    <div ref={containerRef} className={cx('relative', !hasWidthUtility(className) && 'w-full', className)}>
      <input
        ref={inputRef}
        id={comboId}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setOpen(true)
        }}
        onFocus={openMenu}
        onClick={openMenu}
        onKeyDown={onKeyDown}
        className="h-8 w-full rounded-sm border border-line bg-surface px-2 text-[14px] text-ink focus:border-accent disabled:bg-surface-2 disabled:text-faint"
      />
      {open && createPortal(
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          style={listStyle}
          className="z-50 max-h-60 overflow-auto rounded-md border border-line bg-surface p-1 text-[14px] shadow-dropdown"
        >
          {filtered.length === 0 ? (
            <li role="presentation" className="px-2 py-1.5 text-muted">{emptyMessage}</li>
          ) : (
            filtered.map((option, index) => {
              const active = index === clampedActive
              const selected = option.value === selectedValue
              return (
                <li
                  key={option.value}
                  id={`${listboxId}-opt-${index}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => { event.preventDefault(); select(option) }}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  className={cx(
                    'cursor-pointer rounded-sm px-2 py-1.5 text-ink',
                    active && 'bg-accent-soft text-accent',
                    option.disabled && 'cursor-default text-faint',
                  )}
                >
                  {option.label}
                </li>
              )
            })
          )}
        </ul>,
        document.body,
      )}
    </div>
  )
}
