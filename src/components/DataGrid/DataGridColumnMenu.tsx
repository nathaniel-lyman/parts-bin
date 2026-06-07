import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import type { GridAction, LedgerGridColumn } from './types'

interface Props {
  columnId: string
  header: string
  type: NonNullable<LedgerGridColumn<unknown>['type']>
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
  sortDirection,
  hideable,
  canPin,
  pinSide,
  dispatch,
}: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const item = 'flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] text-ink hover:bg-surface-2 disabled:text-faint'
  const label = header || columnId

  return (
    <div className="relative inline-block">
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
        <span aria-hidden="true">...</span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div role="menu" className="shadow-dropdown absolute right-0 z-20 mt-1 w-52 rounded-[2px] border border-line bg-surface py-1">
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
              <div className="micro mb-1 text-faint">Filter ({type})</div>
              <Select className="mb-1 w-full" disabled aria-label={`${label} filter operator`}>
                <option>contains</option>
              </Select>
              <Input className="w-full" disabled placeholder="Filter value..." aria-label={`${label} filter value`} />
              <div className="micro mt-1 text-faint">Filter wired in Phase 3</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

