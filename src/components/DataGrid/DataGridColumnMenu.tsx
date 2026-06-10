import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { FILTER_OPERATORS, type FilterColumnType, type FilterValue } from './filtering'
import type { GridAction, LedgerGridColumn } from './types'

const MENU_WIDTH = 208
const FILTER_PANEL_WIDTH = 720
const VIEWPORT_GAP = 8
const numericTypes = new Set<FilterColumnType>(['number', 'currency', 'percent'])

const operatorLabels: Record<string, string> = {
  contains: 'Contains',
  equals: '=',
  greaterThan: '>',
  lessThan: '<',
  between: 'Between',
  startsWith: 'Starts with',
  isEmpty: 'Is empty',
  before: 'Before',
  after: 'After',
  is: 'Is',
  isAnyOf: 'Is any of',
}

interface Props {
  columnId: string
  header: string
  type: NonNullable<LedgerGridColumn<unknown>['type']>
  filterMeta?: { type?: FilterColumnType; options?: string[] }
  currentFilter?: FilterValue
  sortDirection: 'asc' | 'desc' | false
  hideable: boolean
  canPin: boolean
  pinSide: 'left' | 'right' | false
  dispatch: (action: GridAction) => void
  onAutofit?: (columnId: string) => void
}

export function DataGridColumnMenu({
  columnId,
  header,
  type,
  filterMeta,
  currentFilter,
  sortDirection,
  hideable,
  canPin,
  pinSide,
  dispatch,
  onAutofit,
}: Props) {
  const [open, setOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [draftOperator, setDraftOperator] = useState<string>('')
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: VIEWPORT_GAP })
  const [filterPosition, setFilterPosition] = useState({ top: 0, left: VIEWPORT_GAP, width: FILTER_PANEL_WIDTH })
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)
  const close = () => {
    setOpen(false)
    setFilterOpen(false)
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

  const setFilter = (nextOperator: string, nextValue: unknown) => {
    const emptyRange = Array.isArray(nextValue) && nextValue.every((item) => item === '' || item === null || item === undefined)
    if (nextOperator !== 'isEmpty' && (nextValue === '' || nextValue === null || nextValue === undefined || emptyRange)) {
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
    if (!open && !filterOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setFilterOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filterOpen, open])

  useEffect(() => {
    if (!filterOpen) return
    const target = filterPanelRef.current?.querySelector<HTMLElement>('select:not(:disabled), input:not(:disabled), button:not(:disabled)')
    target?.focus()
  }, [filterOpen])

  useLayoutEffect(() => {
    if (!open && !filterOpen) return
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
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [filterOpen, open])

  return (
    <div ref={triggerRef} className="relative inline-block">
      <Button
        variant="ghost"
        size="compact"
        aria-label={`${label} column menu`}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
      >
        <span aria-hidden="true">⋮</span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div
            ref={menuRef}
            role="menu"
            aria-label={`${label} column menu`}
            className="shadow-dropdown fixed z-30 w-52 rounded-[2px] border border-line bg-surface py-1"
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
            {filterType && <div className="my-1 border-t border-line" />}
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
        </>
      )}
      {filterOpen && filterType && (
        <>
          <div className="fixed inset-0 z-20" onClick={close} />
          <div
            ref={filterPanelRef}
            role="dialog"
            aria-label={`${label} filter`}
            className="shadow-modal fixed z-30 rounded-[4px] border border-line bg-surface p-4"
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
                    setDraftOperator(event.target.value)
                    if (event.target.value === 'isEmpty') setFilter(event.target.value, true)
                    else if (event.target.value === 'between' && Array.isArray(value)) setFilter(event.target.value, value)
                    else if (value !== '' && value !== null && value !== undefined && !Array.isArray(value)) setFilter(event.target.value, value)
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
                    disabled={operator === 'isEmpty'}
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
        </>
      )}
    </div>
  )
}
