import { useState } from 'react'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { DENSITIES } from './types'
import type { Density, GridAction, LedgerGridColumn } from './types'

interface Props<TData> {
  columns: Pick<LedgerGridColumn<TData>, 'id' | 'header' | 'hideable'>[]
  columnVisibility: Record<string, boolean>
  density: Density
  dispatch: (action: GridAction) => void
}

export function DataGridToolbar<TData>({ columns, columnVisibility, density, dispatch }: Props<TData>) {
  const [open, setOpen] = useState(false)
  const hideable = columns.filter((column) => column.hideable !== false && column.id !== 'actions')

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
      <div className="ml-auto flex items-center gap-2">
        <label className="micro flex items-center gap-1 text-faint">
          <span>Density</span>
          <Select
            aria-label="Density"
            className="w-36"
            value={density}
            onChange={(event) => dispatch({ type: 'SET_DENSITY', density: event.target.value as Density })}
          >
            {DENSITIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </label>
        <div className="relative">
          <Button onClick={() => setOpen((value) => !value)} aria-expanded={open}>Columns</Button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="shadow-dropdown absolute right-0 z-20 mt-1 w-44 rounded-[2px] border border-line bg-surface py-1">
                <div className="micro px-3 py-1 text-faint">Toggle columns</div>
                {hideable.map((column) => {
                  const label = typeof column.header === 'string' && column.header ? column.header : column.id
                  return (
                    <label key={column.id} className="flex cursor-pointer items-center gap-2 px-3 py-1 text-[13px] text-ink hover:bg-surface-2">
                      <input
                        type="checkbox"
                        aria-label={label}
                        checked={columnVisibility[column.id] ?? true}
                        onChange={() => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', id: column.id })}
                      />
                      {label}
                    </label>
                  )
                })}
                <div className="mt-1 border-t border-line px-3 py-1 pt-1">
                  <button className="text-[12px] text-accent hover:underline" onClick={() => { dispatch({ type: 'RESET_COLUMNS' }); setOpen(false) }}>
                    Reset to default
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

