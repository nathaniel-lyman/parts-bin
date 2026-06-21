import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EllipsisVertical, ListFilter } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { FILTER_OPERATORS, VALUELESS_OPERATORS, type FilterColumnType, type FilterValue } from './filtering'
import {
  NUMBER_FORMAT_CURRENCIES,
  NUMBER_FORMAT_NOTATIONS,
  NUMBER_FORMAT_SIGN_DISPLAYS,
  NUMBER_FORMAT_STYLES,
  formatDataGridNumber,
  isNumericColumnType,
  resolveNumberFormat,
} from './numberFormat'
import type { DataGridNumberFormat, GridAction, DataGridColumn } from './types'

const MENU_WIDTH = 208
const FILTER_PANEL_WIDTH = 720
const FORMAT_PANEL_WIDTH = 560
const VIEWPORT_GAP = 8
const numericTypes = new Set<FilterColumnType>(['number', 'currency', 'percent'])

const operatorLabels: Record<string, string> = {
  contains: 'Contains',
  notContains: 'Does not contain',
  equals: '=',
  notEquals: '≠',
  greaterThan: '>',
  gte: '≥',
  lessThan: '<',
  lte: '≤',
  between: 'Between',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  isEmpty: 'Is empty',
  blank: 'Is blank',
  notBlank: 'Is not blank',
  before: 'Before',
  after: 'After',
  is: 'Is',
  isAnyOf: 'Is any of',
}

const formatStyleLabels: Record<NonNullable<DataGridNumberFormat['style']>, string> = {
  number: 'Number',
  currency: 'Currency',
  percent: 'Percent',
}

const signDisplayLabels: Record<NonNullable<DataGridNumberFormat['signDisplay']>, string> = {
  auto: 'Auto',
  always: 'Always',
  exceptZero: 'Except zero',
  never: 'Never',
}

function coerceFraction(value: string): number | undefined {
  if (value === '') return undefined
  const number = Number(value)
  if (!Number.isFinite(number)) return undefined
  return Math.max(0, Math.min(20, Math.trunc(number)))
}

function coerceScale(value: string): number | undefined {
  if (value === '') return undefined
  const number = Number(value)
  if (!Number.isFinite(number)) return undefined
  return number
}

interface Props {
  columnId: string
  header: string
  type: NonNullable<DataGridColumn<unknown>['type']>
  filterMeta?: { type?: FilterColumnType; options?: string[] }
  currentFilter?: FilterValue
  columnNumberFormat?: DataGridNumberFormat
  currentNumberFormat?: DataGridNumberFormat
  sortDirection: 'asc' | 'desc' | false
  hideable: boolean
  canPin: boolean
  pinSide: 'left' | 'right' | false
  canGroup?: boolean
  isGrouped?: boolean
  dispatch: (action: GridAction) => void
  onAutofit?: (columnId: string) => void
}

export function DataGridColumnMenu({
  columnId,
  header,
  type,
  filterMeta,
  currentFilter,
  columnNumberFormat,
  currentNumberFormat,
  sortDirection,
  hideable,
  canPin,
  pinSide,
  canGroup,
  isGrouped,
  dispatch,
  onAutofit,
}: Props) {
  const [open, setOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [formatOpen, setFormatOpen] = useState(false)
  const [draftOperator, setDraftOperator] = useState<string>('')
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: VIEWPORT_GAP })
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: VIEWPORT_GAP, width: FILTER_PANEL_WIDTH })
  const [formatPosition, setFormatPosition] = useState({ top: 0, left: VIEWPORT_GAP, width: FORMAT_PANEL_WIDTH })
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)
  const formatPanelRef = useRef<HTMLDivElement | null>(null)
  const portalRoot = typeof document === 'undefined' ? null : document.body
  const close = () => {
    setOpen(false)
    setFilterOpen(false)
    setFormatOpen(false)
  }
  const item = 'flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] text-ink hover:bg-surface-2 disabled:text-faint'
  const label = header || columnId
  const filterType = filterMeta?.type ?? (type === 'actions' ? undefined : type)
  const operators = filterType ? FILTER_OPERATORS[filterType] : []
  const fallbackOperator = draftOperator || operators[0] || 'contains'
  const operator = String(currentFilter?.operator ?? fallbackOperator)
  const value = currentFilter?.value
  const valueInputType = filterType && numericTypes.has(filterType)
    ? 'number'
    : filterType === 'date'
      ? 'date'
      : 'text'
  const isBetween = operator === 'between'
  const rangeValue = Array.isArray(value) ? value : ['', '']
  const canFormatNumber = isNumericColumnType(type)
  const effectiveNumberFormat = canFormatNumber
    ? resolveNumberFormat(type, columnNumberFormat, currentNumberFormat)
    : undefined
  const setNumberFormat = (patch: DataGridNumberFormat) => {
    if (!effectiveNumberFormat) return
    const next = { ...effectiveNumberFormat, ...patch }
    if (next.minimumFractionDigits !== undefined && next.maximumFractionDigits !== undefined && next.minimumFractionDigits > next.maximumFractionDigits) {
      next.maximumFractionDigits = next.minimumFractionDigits
    }
    dispatch({ type: 'SET_COLUMN_NUMBER_FORMAT', columnId, format: next })
  }

  const setFilter = (nextOperator: string, nextValue: unknown) => {
    const emptyRange = Array.isArray(nextValue) && nextValue.every((item) => item === '' || item === null || item === undefined)
    if (!VALUELESS_OPERATORS.has(nextOperator) && (nextValue === '' || nextValue === null || nextValue === undefined || emptyRange)) {
      dispatch({ type: 'CLEAR_COLUMN_FILTER', columnId })
      return
    }
    dispatch({ type: 'SET_COLUMN_FILTER', columnId, value: { operator: nextOperator as FilterValue['operator'], value: nextValue } })
  }

  const toggleEnum = (option: string, checked: boolean) => {
    const current = Array.isArray(value) ? value.map(String) : []
    const next = checked ? [...current, option] : current.filter((item) => item !== option)
    if (next.length === 0) dispatch({ type: 'CLEAR_COLUMN_FILTER', columnId })
    else setFilter('isAnyOf', next)
  }

  useEffect(() => {
    if (!open && !filterOpen && !formatOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setFilterOpen(false)
        setFormatOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filterOpen, formatOpen, open])

  useEffect(() => {
    if (!filterOpen) return
    const target = filterPanelRef.current?.querySelector<HTMLElement>('select:not(:disabled), input:not(:disabled), button:not(:disabled)')
    target?.focus()
  }, [filterOpen])

  useEffect(() => {
    if (!formatOpen) return
    const target = formatPanelRef.current?.querySelector<HTMLElement>('select:not(:disabled), input:not(:disabled), button:not(:disabled)')
    target?.focus()
  }, [formatOpen])

  useLayoutEffect(() => {
    if (!open && !filterOpen && !formatOpen) return
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      if (open) {
        const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP)
        const left = Math.min(Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH), maxLeft)
        const menuHeight = menuRef.current?.offsetHeight ?? 0
        const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - menuHeight - VIEWPORT_GAP)
        const top = Math.min(rect.bottom + 4, maxTop)
        setMenuPosition({ top, left })
      }
      if (filterOpen) {
        const width = Math.min(FILTER_PANEL_WIDTH, Math.max(280, window.innerWidth - VIEWPORT_GAP * 2))
        const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - width - VIEWPORT_GAP)
        const left = Math.min(Math.max(VIEWPORT_GAP, rect.left), maxLeft)
        const panelHeight = filterPanelRef.current?.offsetHeight ?? 0
        const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - panelHeight - VIEWPORT_GAP)
        const top = Math.min(rect.bottom + 8, maxTop)
        setFilterPosition({ top, left, width })
      }
      if (formatOpen) {
        const width = Math.min(FORMAT_PANEL_WIDTH, Math.max(280, window.innerWidth - VIEWPORT_GAP * 2))
        const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - width - VIEWPORT_GAP)
        const left = Math.min(Math.max(VIEWPORT_GAP, rect.left), maxLeft)
        const panelHeight = formatPanelRef.current?.offsetHeight ?? 0
        const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - panelHeight - VIEWPORT_GAP)
        const top = Math.min(rect.bottom + 8, maxTop)
        setFormatPosition({ top, left, width })
      }
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [filterOpen, formatOpen, open])

  return (
    <div ref={triggerRef} className="relative inline-flex items-center gap-0.5">
      {filterType && (
        <Button
          variant="ghost"
          size="compact"
          className={`h-8 w-8 px-0 ${currentFilter ? 'text-accent' : 'text-muted hover:text-ink'}`}
          aria-label={`${label} column filter`}
          aria-pressed={currentFilter ? true : undefined}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            setOpen(false)
            setFilterOpen(true)
          }}
        >
          <ListFilter aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="compact"
        className="h-8 w-8 px-0 text-muted hover:text-ink"
        aria-label={`${label} column menu`}
        aria-expanded={open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
      >
        <EllipsisVertical aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
      </Button>
      {open && portalRoot && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            ref={menuRef}
            role="menu"
            aria-label={`${label} column menu`}
            className="popover-enter shadow-dropdown fixed z-50 w-52 rounded-[2px] border border-line bg-surface py-1"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'SET_SORT', id: columnId, desc: false, additive: false }); close() }}>Sort ascending</button>
            <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'SET_SORT', id: columnId, desc: true, additive: false }); close() }}>Sort descending</button>
            <button role="menuitem" className={item} disabled={sortDirection === false} onClick={() => { dispatch({ type: 'CLEAR_SORT', id: columnId }); close() }}>Clear sort</button>
            <div className="my-1 border-t border-line" />
            {filterType && (
              <button
                role="menuitem"
                className={item}
                onClick={() => {
                  setOpen(false)
                  setFilterOpen(true)
                }}
              >
                Filter
              </button>
            )}
            {canFormatNumber && (
              <button
                role="menuitem"
                className={item}
                onClick={() => {
                  setOpen(false)
                  setFormatOpen(true)
                }}
              >
                Number format
              </button>
            )}
            {(filterType || canFormatNumber) && <div className="my-1 border-t border-line" />}
            {canGroup && (
              <>
                <button
                  role="menuitem"
                  className={item}
                  onClick={() => { dispatch({ type: 'TOGGLE_GROUP_BY', columnId }); close() }}
                >
                  {isGrouped ? `Ungroup by ${label}` : `Group by ${label}`}
                </button>
                <div className="my-1 border-t border-line" />
              </>
            )}
            {hideable && (
              <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', id: columnId }); close() }}>Hide column</button>
            )}
            {onAutofit && (
              <button role="menuitem" className={item} onClick={() => { onAutofit(columnId); close() }}>Autofit to content</button>
            )}
            <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'RESET_COLUMN_WIDTH', id: columnId }); close() }}>Reset width</button>
            {canPin && (
              <>
                <div className="my-1 border-t border-line" />
                {pinSide === false ? (
                  <>
                    <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'PIN_COLUMN', id: columnId, side: 'left' }); close() }}>Pin left</button>
                    <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'PIN_COLUMN', id: columnId, side: 'right' }); close() }}>Pin right</button>
                  </>
                ) : (
                  <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'UNPIN_COLUMN', id: columnId }); close() }}>Unpin</button>
                )}
              </>
            )}
          </div>
        </>,
        portalRoot,
      )}
      {filterOpen && filterType && portalRoot && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            ref={filterPanelRef}
            role="dialog"
            aria-label={`${label} filter`}
            className="popover-enter shadow-modal fixed z-50 rounded-[4px] border border-line bg-surface p-4"
            style={{ top: filterPosition.top, left: filterPosition.left, width: filterPosition.width }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.7fr)_minmax(0,1.25fr)_auto] sm:items-end">
              <label className="grid gap-1">
                <span className="micro text-faint">Column</span>
                <Select aria-label="Filter column" value={columnId} disabled>
                  <option value={columnId}>{label}</option>
                </Select>
              </label>
              <label className="grid gap-1">
                <span className="micro text-faint">Operator</span>
                <Select
                  aria-label={`${label} filter operator`}
                  value={operator}
                  onChange={(event) => {
                    const next = event.target.value
                    setDraftOperator(next)
                    if (VALUELESS_OPERATORS.has(next)) setFilter(next, true)
                    else if (next === 'between' && Array.isArray(value)) setFilter(next, value)
                    else if (value !== '' && value !== null && value !== undefined && !Array.isArray(value)) setFilter(next, value)
                  }}
                >
                  {operators.map((item) => (
                    <option key={item} value={item}>{operatorLabels[item] ?? item}</option>
                  ))}
                </Select>
              </label>
              <div className="grid gap-1">
                <span className="micro text-faint">Value</span>
                {filterType === 'enum' || filterType === 'status' ? (
                  <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-[2px] border border-line bg-surface px-2 py-1" aria-label={`${label} filter options`}>
                    {(filterMeta?.options ?? []).map((option) => (
                      <label key={option} className="flex items-center gap-2 text-[13px] text-ink">
                        <input
                          type="checkbox"
                          checked={Array.isArray(value) && value.map(String).includes(option)}
                          onChange={(event) => toggleEnum(option, event.target.checked)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : isBetween ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type={valueInputType}
                      placeholder="Min"
                      aria-label={`${label} filter minimum`}
                      value={typeof rangeValue[0] === 'string' || typeof rangeValue[0] === 'number' ? rangeValue[0] : ''}
                      onChange={(event) => setFilter(operator, [event.target.value, rangeValue[1]])}
                    />
                    <Input
                      type={valueInputType}
                      placeholder="Max"
                      aria-label={`${label} filter maximum`}
                      value={typeof rangeValue[1] === 'string' || typeof rangeValue[1] === 'number' ? rangeValue[1] : ''}
                      onChange={(event) => setFilter(operator, [rangeValue[0], event.target.value])}
                    />
                  </div>
                ) : (
                  <Input
                    type={valueInputType}
                    placeholder="Filter value..."
                    aria-label={`${label} filter value`}
                    value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                    disabled={VALUELESS_OPERATORS.has(operator)}
                    onChange={(event) => setFilter(operator, event.target.value)}
                  />
                )}
              </div>
              <div className="flex gap-2 sm:justify-end">
                <Button
                  variant="ghost"
                  size="compact"
                  onClick={() => {
                    dispatch({ type: 'CLEAR_COLUMN_FILTER', columnId })
                    setDraftOperator('')
                  }}
                >
                  Clear
                </Button>
                <Button variant="secondary" size="compact" aria-label={`Close ${label} filter`} onClick={close}>Close</Button>
              </div>
            </div>
          </div>
        </>,
        portalRoot,
      )}
      {formatOpen && effectiveNumberFormat && portalRoot && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            ref={formatPanelRef}
            role="dialog"
            aria-label={`${label} number format`}
            className="popover-enter shadow-modal fixed z-50 rounded-[4px] border border-line bg-surface p-4"
            style={{ top: formatPosition.top, left: formatPosition.left, width: formatPosition.width }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="micro text-faint">Style</span>
                  <Select
                    aria-label={`${label} number format style`}
                    value={effectiveNumberFormat.style ?? 'number'}
                    onChange={(event) => {
                      const style = event.target.value as NonNullable<DataGridNumberFormat['style']>
                      setNumberFormat({ style, scale: style === 'percent' ? 0.01 : 1 })
                    }}
                  >
                    {NUMBER_FORMAT_STYLES.map((style) => (
                      <option key={style} value={style}>{formatStyleLabels[style]}</option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className="micro text-faint">Notation</span>
                  <Select
                    aria-label={`${label} number format notation`}
                    value={effectiveNumberFormat.notation ?? 'standard'}
                    onChange={(event) => setNumberFormat({ notation: event.target.value as DataGridNumberFormat['notation'] })}
                  >
                    {NUMBER_FORMAT_NOTATIONS.map((notation) => (
                      <option key={notation} value={notation}>{notation === 'compact' ? 'Compact' : 'Standard'}</option>
                    ))}
                  </Select>
                </label>
                {(effectiveNumberFormat.style ?? 'number') === 'currency' && (
                  <label className="grid gap-1">
                    <span className="micro text-faint">Currency</span>
                    <Select
                      aria-label={`${label} number format currency`}
                      value={effectiveNumberFormat.currency ?? 'USD'}
                      onChange={(event) => setNumberFormat({ currency: event.target.value })}
                    >
                      {NUMBER_FORMAT_CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </Select>
                  </label>
                )}
                <label className="grid gap-1">
                  <span className="micro text-faint">Sign</span>
                  <Select
                    aria-label={`${label} number format sign`}
                    value={effectiveNumberFormat.signDisplay ?? 'auto'}
                    onChange={(event) => setNumberFormat({ signDisplay: event.target.value as DataGridNumberFormat['signDisplay'] })}
                  >
                    {NUMBER_FORMAT_SIGN_DISPLAYS.map((display) => (
                      <option key={display} value={display}>{signDisplayLabels[display]}</option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className="micro text-faint">Scale</span>
                  <Input
                    type="number"
                    step="0.01"
                    aria-label={`${label} number format scale`}
                    value={effectiveNumberFormat.scale ?? 1}
                    onChange={(event) => setNumberFormat({ scale: coerceScale(event.target.value) })}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="micro text-faint">Min decimals</span>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    aria-label={`${label} number format minimum decimals`}
                    value={effectiveNumberFormat.minimumFractionDigits ?? ''}
                    onChange={(event) => setNumberFormat({ minimumFractionDigits: coerceFraction(event.target.value) })}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="micro text-faint">Max decimals</span>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    aria-label={`${label} number format maximum decimals`}
                    value={effectiveNumberFormat.maximumFractionDigits ?? ''}
                    onChange={(event) => setNumberFormat({ maximumFractionDigits: coerceFraction(event.target.value) })}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={effectiveNumberFormat.useGrouping ?? true}
                  onChange={(event) => setNumberFormat({ useGrouping: event.target.checked })}
                />
                Use thousands separators
              </label>
              <div className="rounded-[2px] border border-line bg-surface-2 px-3 py-2">
                <span className="micro mr-2 text-faint">Preview</span>
                <span className="num text-ink">{formatDataGridNumber(12345.678, type, undefined, effectiveNumberFormat)}</span>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <Button
                  variant="ghost"
                  size="compact"
                  onClick={() => dispatch({ type: 'CLEAR_COLUMN_NUMBER_FORMAT', columnId })}
                >
                  Reset
                </Button>
                <Button variant="secondary" size="compact" aria-label={`Close ${label} number format`} onClick={close}>Close</Button>
              </div>
            </div>
          </div>
        </>,
        portalRoot,
      )}
    </div>
  )
}
