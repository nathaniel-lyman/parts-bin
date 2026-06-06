import { useState } from 'react'
import type { ColumnVisibility, OptionalColumn } from '../../hooks/useColumnVisibility'
import { Button } from '../ui/Button'

const LABELS: Record<OptionalColumn, string> = { name: 'Name', arr: 'ARR', since: 'Since' }

export function ColumnsMenu({ visibility, onToggle }: { visibility: ColumnVisibility; onToggle: (c: OptionalColumn) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button onClick={() => setOpen((o) => !o)}>⚏ Columns</Button>
      {open && (
        <div className="shadow-dropdown absolute right-0 z-10 mt-1 w-40 rounded-[2px] border border-line bg-surface p-2">
          {(Object.keys(LABELS) as OptionalColumn[]).map((c) => (
            <label key={c} className="flex items-center gap-2 px-1 py-1 text-[13px] text-ink">
              <input type="checkbox" checked={visibility[c]} onChange={() => onToggle(c)} />
              {LABELS[c]}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
