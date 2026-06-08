import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button } from './Button'
import { formatDateRangeLabel, type DateRange, type DateRangePreset } from './dateUtils'
import { cx, hasWidthUtility } from './utils'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label: ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export interface DateRangePickerProps {
  label?: ReactNode
  value: DateRange
  onValueChange: (value: DateRange) => void
  presets?: DateRangePreset[]
  className?: string
  emptyLabel?: ReactNode
}

export function DatePicker({ label, value = '', onValueChange, id, className, ...rest }: DatePickerProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label className={cx('grid gap-1.5', !hasWidthUtility(className) && 'w-full')}>
      <span className="micro">{label}</span>
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cx(
          'h-8 rounded-[2px] border border-line bg-surface px-2 text-[13px] text-ink focus:border-accent disabled:bg-surface-2 disabled:text-faint',
          className,
        )}
        {...rest}
      />
    </label>
  )
}

export function DateRangePicker({
  label = 'Date range',
  value,
  onValueChange,
  presets = [],
  className,
  emptyLabel = 'Select dates',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)
  const pickerId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelText = formatDateRangeLabel(value)
  const invalid = Boolean(draft.start && draft.end && draft.start > draft.end)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const openPanel = () => {
    setDraft(value)
    setOpen(true)
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLInputElement>('input')?.focus())
  }

  const closePanel = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePanel()
    }
  }

  const applyDraft = () => {
    if (invalid) return
    onValueChange(draft)
    closePanel()
  }

  const clear = () => {
    const emptyRange = { start: '', end: '' }
    setDraft(emptyRange)
    onValueChange(emptyRange)
    closePanel()
  }

  return (
    <div className={cx('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? pickerId : undefined}
        onClick={() => (open ? closePanel() : openPanel())}
        className="inline-flex h-8 min-w-56 items-center justify-between gap-3 rounded-[2px] border border-line bg-surface px-3 text-left text-[13px] text-ink hover:bg-surface-2"
      >
        <span className="micro shrink-0">{label}</span>
        <span className={cx('num truncate text-[12px]', labelText === emptyLabel && 'text-muted')}>{labelText}</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          id={pickerId}
          role="dialog"
          aria-label={typeof label === 'string' ? label : 'Date range'}
          tabIndex={-1}
          onKeyDown={onPanelKeyDown}
          className="absolute right-0 top-full z-40 mt-2 grid w-[340px] max-w-[calc(100vw-2rem)] gap-3 border border-line bg-surface p-3 text-[13px] text-ink shadow-dropdown"
        >
          {presets.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  size="compact"
                  variant="secondary"
                  onClick={() => setDraft(preset.range)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <DatePicker label="Start" value={draft.start} onValueChange={(start) => setDraft((current) => ({ ...current, start }))} />
            <DatePicker label="End" value={draft.end} onValueChange={(end) => setDraft((current) => ({ ...current, end }))} />
          </div>
          {invalid && <p className="m-0 text-[12px] font-medium text-neg">Start date must be before end date.</p>}
          <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
            <Button size="compact" variant="ghost" onClick={clear}>Clear</Button>
            <Button size="compact" onClick={closePanel}>Cancel</Button>
            <Button size="compact" variant="primary" disabled={invalid} onClick={applyDraft}>Apply</Button>
          </div>
        </div>
      )}
    </div>
  )
}
