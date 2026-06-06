import type { Segment } from '../../data/types'
import type { ColumnVisibility } from '../../hooks/useColumnVisibility'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ColumnsMenu } from './ColumnsMenu'

const SEGMENTS: Segment[] = ['Enterprise', 'Mid-market', 'Startup']

interface Props {
  search: string
  onSearch: (v: string) => void
  segments: string[]
  onToggleSegment: (s: string) => void
  visibility: ColumnVisibility
  onToggleColumn?: (c: 'name' | 'arr' | 'since') => void
  onNew?: () => void
}

export function Toolbar({ search, onSearch, segments, onToggleSegment, visibility, onToggleColumn, onNew }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
      <div className="w-64"><Input placeholder="Search accounts or owners…" value={search} onChange={(e) => onSearch(e.target.value)} /></div>
      {SEGMENTS.map((s) => (
        <button
          key={s}
          onClick={() => onToggleSegment(s)}
          className={`micro rounded-[2px] border px-2 py-1 ${segments.includes(s) ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:bg-surface-2'}`}
        >
          {s}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        {onToggleColumn && <ColumnsMenu visibility={visibility} onToggle={onToggleColumn} />}
        {onNew && <Button variant="primary" onClick={onNew}>+ New account</Button>}
      </div>
    </div>
  )
}
