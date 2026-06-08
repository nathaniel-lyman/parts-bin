import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Input } from './Input'
import { cx } from './utils'

export interface AppliedFilter {
  id: string
  label: ReactNode
  value?: ReactNode
  onRemove?: () => void
}

export interface FilterChipProps extends AppliedFilter {
  className?: string
}

export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  const content = (
    <>
      <span className="font-medium text-ink">{label}</span>
      {value && <span className="text-muted">{value}</span>}
    </>
  )

  if (!onRemove) {
    return (
      <span className={cx('inline-flex h-7 max-w-full items-center gap-1.5 rounded-[2px] border border-line bg-surface-2 px-2 text-[12px]', className)}>
        {content}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${String(label)} filter`}
      className={cx('inline-flex h-7 max-w-full items-center gap-1.5 rounded-[2px] border border-line bg-surface-2 px-2 text-[12px] hover:bg-surface', className)}
    >
      {content}
      <span aria-hidden="true" className="text-faint">x</span>
    </button>
  )
}

export interface AppliedFiltersBarProps {
  filters: AppliedFilter[]
  onClearAll?: () => void
  emptyLabel?: ReactNode
  className?: string
}

export function AppliedFiltersBar({ filters, onClearAll, emptyLabel = 'No filters applied', className }: AppliedFiltersBarProps) {
  return (
    <div className={cx('flex min-w-0 flex-wrap items-center gap-2 border border-line bg-surface px-3 py-2', className)}>
      <span className="micro shrink-0">Filters</span>
      {filters.length > 0 ? (
        <>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {filters.map((filter) => <FilterChip key={filter.id} {...filter} />)}
          </div>
          {onClearAll && (
            <Button type="button" size="compact" variant="ghost" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </>
      ) : (
        <span className="text-[13px] text-muted">{emptyLabel}</span>
      )}
    </div>
  )
}

export interface FacetedFilterOption {
  value: string
  label: ReactNode
  count?: number
  disabled?: boolean
}

export interface FacetedFilterProps {
  label: ReactNode
  options: FacetedFilterOption[]
  selectedValues: string[]
  onSelectedValuesChange: (values: string[]) => void
  searchPlaceholder?: string
  emptyMessage?: ReactNode
  className?: string
}

export function FacetedFilter({
  label,
  options,
  selectedValues,
  onSelectedValuesChange,
  searchPlaceholder = 'Search filters',
  emptyMessage = 'No options',
  className,
}: FacetedFilterProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return options
    return options.filter((option) => String(option.label).toLowerCase().includes(normalized))
  }, [options, query])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const toggleValue = (value: string) => {
    const next = new Set(selectedSet)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onSelectedValuesChange(Array.from(next))
  }

  const clear = () => {
    onSelectedValuesChange([])
    triggerRef.current?.focus()
  }

  return (
    <div ref={ref} className={cx('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 items-center justify-center gap-2 rounded-[2px] border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2"
      >
        <span>{label}</span>
        {selectedValues.length > 0 && <span className="num text-muted">{selectedValues.length}</span>}
      </button>
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={`${String(label)} filter`}
          className="absolute left-0 top-full z-40 mt-2 grid w-72 gap-3 border border-line bg-surface p-3 text-[13px] text-ink shadow-dropdown"
        >
          <Input
            aria-label={`${String(label)} filter search`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
          <div className="grid max-h-60 gap-1 overflow-auto">
            {filteredOptions.length > 0 ? filteredOptions.map((option) => (
              <Checkbox
                key={option.value}
                label={(
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{option.label}</span>
                    {typeof option.count === 'number' && <span className="num text-muted">{option.count}</span>}
                  </span>
                )}
                checked={selectedSet.has(option.value)}
                disabled={option.disabled}
                onChange={() => toggleValue(option.value)}
              />
            )) : (
              <p className="m-0 py-4 text-center text-[13px] text-muted">{emptyMessage}</p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
            <span className="text-[12px] text-muted">{selectedValues.length} selected</span>
            <Button type="button" size="compact" variant="ghost" onClick={clear} disabled={selectedValues.length === 0}>
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
