import { useState } from 'react'
import type { ColumnVisibility, OptionalColumn } from '../../hooks/useColumnVisibility'
import { Button } from '../ui/Button'

const LABELS: Record<OptionalColumn, string> = { name: 'Name', arr: 'ARR', since: 'Since' }

interface Props {
  visibility: ColumnVisibility
  onToggle: (c: OptionalColumn) => void
  onReset?: () => void
}

export function ColumnsMenu({ visibility, onToggle, onReset }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button onClick={() => setOpen((o) => !o)} aria-expanded={open}>⚏ Columns</Button>
      {open && (
        <>
          {/* click-outside backdrop (matches demo.html:242) */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="shadow-dropdown absolute right-0 z-20 mt-1 w-44 rounded-[2px] border border-line bg-surface py-1">
            <div className="micro px-3 py-1 text-faint">Toggle columns</div>
            {(Object.keys(LABELS) as OptionalColumn[]).map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 px-3 py-1 text-[13px] text-ink hover:bg-surface-2">
                <input type="checkbox" checked={visibility[c]} onChange={() => onToggle(c)} />
                {LABELS[c]}
              </label>
            ))}
            {onReset && (
              <div className="mt-1 border-t border-line px-3 py-1 pt-1">
                <button className="text-[12px] text-accent hover:underline" onClick={() => { onReset(); setOpen(false) }}>
                  Reset to default
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
