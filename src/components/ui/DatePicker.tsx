import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { CalendarGlyph } from '../shell/icons'
import { Button } from './Button'
import { formatDateRangeLabel, type DateRange, type DateRangePreset } from './dateUtils'
import { useAnchoredPosition } from './useAnchoredPosition'
import { useDialogFocusTrap } from './useDialogFocusTrap'
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

export function DatePicker({ label, value = '', onValueChange, id, className, disabled, ...rest }: DatePickerProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const calendarLabel = typeof label === 'string' ? `Open ${label} calendar` : 'Open date calendar'

  const openNativePicker = () => {
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.showPicker?.()
  }

  return (
    <label className={cx('grid gap-1.5', !hasWidthUtility(className) && 'w-full')}>
      <span className="micro">{label}</span>
      <span className="relative block">
        <input
          ref={inputRef}
          id={inputId}
          type="date"
          value={value}
          disabled={disabled}
          onInput={(event) => onValueChange?.(event.currentTarget.value)}
          onChange={(event) => onValueChange?.(event.target.value)}
          className={cx(
            'h-8 rounded-sm border border-line bg-surface px-2 pr-9 text-[13px] text-ink focus:border-accent disabled:bg-surface-2 disabled:text-faint',
            !hasWidthUtility(className) && 'w-full',
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          aria-label={calendarLabel}
          title={calendarLabel}
          disabled={disabled}
          onClick={openNativePicker}
          className="absolute right-1 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:bg-surface-2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent disabled:text-faint"
        >
          <CalendarGlyph className="h-3.5 w-3.5" />
        </button>
      </span>
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
  const panelStyle = useAnchoredPosition(open, triggerRef, panelRef, { align: 'end' })
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
  }

  const closePanel = () => {
    setOpen(false)
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
        className="inline-flex h-8 min-w-56 items-center justify-between gap-3 rounded-sm border border-line bg-surface px-3 text-left text-[13px] text-ink hover:bg-surface-2"
      >
        <span className="micro shrink-0">{label}</span>
        <span className={cx('num truncate text-[12px]', labelText === emptyLabel && 'text-muted')}>{labelText}</span>
      </button>
      {open && createPortal(
        <DateRangePanel
          id={pickerId}
          panelRef={panelRef}
          style={panelStyle}
          ariaLabel={typeof label === 'string' ? label : 'Date range'}
          onClose={closePanel}
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
        </DateRangePanel>,
        document.body,
      )}
    </div>
  )
}

interface DateRangePanelProps {
  id: string
  panelRef: RefObject<HTMLDivElement | null>
  style: CSSProperties
  ariaLabel: string
  onClose: () => void
  children: ReactNode
}

// Mounted only while open so the focus trap's open/close lifecycle matches
// Modal's (focus moves in on mount, restores to the opener on unmount).
function DateRangePanel({ id, panelRef, style, ariaLabel, onClose, children }: DateRangePanelProps) {
  useDialogFocusTrap(panelRef, onClose)

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label={ariaLabel}
      tabIndex={-1}
      style={style}
      className="z-50 grid w-[340px] max-w-[calc(100vw-2rem)] gap-3 rounded-md border border-line bg-surface p-3 text-[13px] text-ink shadow-dropdown"
    >
      {children}
    </div>
  )
}
