import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Tag } from './Tag'
import { useAnchoredPosition } from './useAnchoredPosition'
import { cx, hasWidthUtility } from './utils'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  emptyMessage?: string
  // Injected by Field (cloneElement) onto the focusable input.
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * Multi-select, type-to-filter combobox with token chips. Same WAI-ARIA
 * combobox + listbox pattern as Combobox (focus stays on the input, active
 * option tracked via aria-activedescendant); picking an option toggles it and
 * keeps the list open, Backspace on an empty query removes the last token.
 */
export function MultiSelect({
  options,
  values,
  defaultValues,
  onValuesChange,
  placeholder,
  disabled = false,
  id,
  className,
  emptyMessage = 'No matches',
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
}: MultiSelectProps) {
  const generatedId = useId()
  const comboId = id ?? generatedId
  const listboxId = `${comboId}-listbox`

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [internalValues, setInternalValues] = useState<string[]>(defaultValues ?? [])
  const selectedValues = values ?? internalValues
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])
  const selectedOptions = useMemo(
    () => selectedValues
      .map((value) => options.find((option) => option.value === value))
      .filter((option): option is MultiSelectOption => option !== undefined),
    [options, selectedValues],
  )

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

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

  const commit = (next: string[]) => {
    setInternalValues(next)
    onValuesChange?.(next)
  }

  const toggle = (option: MultiSelectOption) => {
    if (option.disabled) return
    commit(
      selectedSet.has(option.value)
        ? selectedValues.filter((value) => value !== option.value)
        : [...selectedValues, option.value],
    )
    // Clear the query so the next search starts fresh; keep the list open for more picks.
    setQuery('')
    setActiveIndex(0)
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
      if (!open) { setOpen(true); return }
      moveActive(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) { setOpen(true); return }
      moveActive(-1)
    } else if (event.key === 'Enter') {
      if (open && filtered[clampedActive]) {
        event.preventDefault()
        toggle(filtered[clampedActive])
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault()
        setOpen(false)
      }
    } else if (event.key === 'Backspace' && query === '' && selectedValues.length > 0) {
      commit(selectedValues.slice(0, -1))
    }
  }

  const activeId = open && filtered[clampedActive] ? `${listboxId}-opt-${clampedActive}` : undefined

  return (
    <div ref={containerRef} className={cx('relative', !hasWidthUtility(className) && 'w-full', className)}>
      <div
        onClick={() => inputRef.current?.focus()}
        className={cx(
          'flex min-h-8 w-full flex-wrap items-center gap-1 rounded-[2px] border border-line bg-surface px-2 py-1 focus-within:border-accent',
          disabled && 'bg-surface-2',
        )}
      >
        {selectedOptions.map((option) => (
          <Tag
            key={option.value}
            label={option.label}
            tone="accent"
            onRemove={disabled ? undefined : () => commit(selectedValues.filter((value) => value !== option.value))}
          />
        ))}
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
          disabled={disabled}
          placeholder={selectedValues.length === 0 ? placeholder : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-20 flex-1 bg-surface text-[13px] text-ink outline-none disabled:bg-surface-2 disabled:text-faint"
        />
      </div>
      {open && createPortal(
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          style={listStyle}
          className="z-50 max-h-60 overflow-auto border border-line bg-surface p-1 text-[13px] shadow-dropdown"
        >
          {filtered.length === 0 ? (
            <li role="presentation" className="px-2 py-1.5 text-muted">{emptyMessage}</li>
          ) : (
            filtered.map((option, index) => {
              const active = index === clampedActive
              const selected = selectedSet.has(option.value)
              return (
                <li
                  key={option.value}
                  id={`${listboxId}-opt-${index}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(event) => { event.preventDefault(); toggle(option) }}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  className={cx(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-[2px] px-2 py-1.5 text-ink',
                    active && 'bg-accent-soft text-accent',
                    option.disabled && 'cursor-default text-faint',
                  )}
                >
                  <span>{option.label}</span>
                  {selected && <span aria-hidden="true">✓</span>}
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
