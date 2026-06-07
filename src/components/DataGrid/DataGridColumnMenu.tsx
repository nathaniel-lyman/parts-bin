import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { FILTER_OPERATORS, type FilterColumnType, type FilterValue } from './filtering'
import type { GridAction, LedgerGridColumn } from './types'

const MENU_WIDTH = 208
const VIEWPORT_GAP = 8

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
}: Props) {
  const [open, setOpen] = useState(false)
  const [draftOperator, setDraftOperator] = useState<string>('')
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: VIEWPORT_GAP })
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const close = () => setOpen(false)
  const item = 'flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] text-ink hover:bg-surface-2 disabled:text-faint'
  const label = header || columnId
  const filterType = filterMeta?.type ?? (type === 'actions' ? undefined : type)
  const operators = filterType ? FILTER_OPERATORS[filterType] : []
  const fallbackOperator = draftOperator || operators[0] || 'contains'
  const operator = String(currentFilter?.operator ?? fallbackOperator)
  const value = currentFilter?.value

  const setFilter = (nextOperator: string, nextValue: unknown) => {
    if (nextOperator !== 'isEmpty' && (nextValue === '' || nextValue === null || nextValue === undefined)) {
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
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - MENU_WIDTH - VIEWPORT_GAP)
      const left = Math.min(Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH), maxLeft)
      const menuHeight = menuRef.current?.offsetHeight ?? 0
      const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - menuHeight - VIEWPORT_GAP)
      const top = Math.min(rect.bottom + 4, maxTop)
      setMenuPosition({ top, left })
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

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
            {hideable && (
              <button role="menuitem" className={item} onClick={() => { dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', id: columnId }); close() }}>Hide column</button>
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
            <div className="my-1 border-t border-line" />
            <div className="px-3 py-1">
              <div className="micro mb-1 text-faint">Filter ({filterType ?? type})</div>
              {filterType === 'enum' || filterType === 'status' ? (
                <div className="space-y-1" aria-label={`${label} filter options`}>
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
              ) : filterType ? (
                <>
                  <Select
                    className="mb-1 w-full"
                    aria-label={`${label} filter operator`}
                    value={operator}
                    onChange={(event) => {
                      setDraftOperator(event.target.value)
                      if (event.target.value === 'isEmpty') setFilter(event.target.value, true)
                      else if (value !== '' && value !== null && value !== undefined) setFilter(event.target.value, value)
                    }}
                  >
                    {operators.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </Select>
                  <Input
                    className="w-full"
                    type={filterType === 'number' || filterType === 'currency' || filterType === 'percent' ? 'number' : filterType === 'date' ? 'date' : 'text'}
                    placeholder="Filter value..."
                    aria-label={`${label} filter value`}
                    value={typeof value === 'string' || typeof value === 'number' ? value : ''}
                    disabled={operator === 'isEmpty'}
                    onChange={(event) => setFilter(operator, event.target.value)}
                  />
                </>
              ) : (
                <div className="text-[13px] text-faint">No filter</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
