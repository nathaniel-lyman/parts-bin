import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { DENSITIES, DENSITY_LABELS } from './types'
import type { Density, GridAction, LedgerGridColumn } from './types'

interface Props<TData> {
  columns: Pick<LedgerGridColumn<TData>, 'id' | 'header' | 'hideable' | 'groupable'>[]
  columnVisibility: Record<string, boolean>
  globalFilter: string
  density: Density
  grouping?: string[]
  enableGrouping?: boolean
  dispatch: (action: GridAction) => void
  enableExport?: boolean
  enableHeaderFilters?: boolean
  headerFiltersOpen?: boolean
  onToggleHeaderFilters?: () => void
  onExportCsv?: () => void
  savedViews?: { id: string; name: string }[]
  onApplyView?: (id: string) => void
  onSaveView?: (name: string) => void
  onDeleteView?: (id: string) => void
  onResetView?: () => void
}

export function DataGridToolbar<TData>({
  columns,
  columnVisibility,
  globalFilter,
  density,
  grouping = [],
  enableGrouping,
  dispatch,
  enableExport,
  enableHeaderFilters,
  headerFiltersOpen,
  onToggleHeaderFilters,
  onExportCsv,
  savedViews,
  onApplyView,
  onSaveView,
  onDeleteView,
  onResetView,
}: Props<TData>) {
  const [open, setOpen] = useState(false)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const hideable = columns.filter((column) => column.hideable !== false && column.id !== 'actions')
  const headerFor = (id: string) => {
    const column = columns.find((item) => item.id === id)
    return typeof column?.header === 'string' && column.header ? column.header : id
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
      <Input
        type="search"
        className="max-w-sm"
        placeholder="Search accounts or owners..."
        aria-label="Quick filter"
        value={globalFilter}
        onChange={(event) => dispatch({ type: 'SET_GLOBAL_FILTER', value: event.target.value })}
      />
      {enableGrouping && grouping.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" data-testid="grouping-chips">
          <span className="micro text-faint">Grouped by</span>
          {grouping.map((id) => (
            <span
              key={id}
              className="micro flex items-center gap-1 rounded-[2px] bg-accent-soft px-1.5 py-0.5 text-accent"
            >
              {headerFor(id)}
              <button
                type="button"
                aria-label={`Remove grouping by ${headerFor(id)}`}
                className="hover:text-ink"
                onClick={() => dispatch({ type: 'TOGGLE_GROUP_BY', columnId: id })}
              >
                ✕
              </button>
            </span>
          ))}
          {grouping.length > 1 && (
            <button
              type="button"
              className="micro text-muted hover:text-ink"
              onClick={() => dispatch({ type: 'CLEAR_GROUPING' })}
            >
              Clear all
            </button>
          )}
        </div>
      )}
      <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">
        {enableExport && (
          <Button size="compact" onClick={onExportCsv} aria-label="Export CSV">
            Export CSV
          </Button>
        )}
        {enableHeaderFilters && (
          <Button
            size="compact"
            variant={headerFiltersOpen ? 'primary' : 'secondary'}
            aria-pressed={headerFiltersOpen}
            onClick={onToggleHeaderFilters}
          >
            Filters
          </Button>
        )}
        {savedViews && (
          <div className="relative">
            <Button size="compact" onClick={() => setViewsOpen((value) => !value)} aria-expanded={viewsOpen}>Views</Button>
            {viewsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setViewsOpen(false)} />
                <div className="shadow-dropdown absolute right-0 z-30 mt-1 w-56 rounded-[2px] border border-line bg-surface p-2">
                  <div className="micro mb-1 text-faint">Saved views</div>
                  <div className="flex flex-col gap-1">
                    {savedViews.length === 0 && <div className="px-1 py-1 text-[12px] text-muted">No saved views</div>}
                    {savedViews.map((view) => (
                      <div key={view.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          className="micro flex-1 px-1 py-1 text-left text-ink hover:bg-surface-2"
                          aria-label={`Apply ${view.name}`}
                          onClick={() => {
                            onApplyView?.(view.id)
                            setViewsOpen(false)
                          }}
                        >
                          {view.name}
                        </button>
                        <button
                          type="button"
                          className="micro px-1 py-1 text-muted hover:text-neg"
                          aria-label={`Delete ${view.name}`}
                          onClick={() => onDeleteView?.(view.id)}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
                    <Input
                      placeholder="View name"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                    />
                    <Button
                      size="compact"
                      disabled={!draftName.trim()}
                      onClick={() => {
                        onSaveView?.(draftName.trim())
                        setDraftName('')
                      }}
                    >
                      Save current
                    </Button>
                    <Button
                      variant="ghost"
                      size="compact"
                      onClick={() => {
                        onResetView?.()
                        setViewsOpen(false)
                      }}
                    >
                      Reset to default
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <label className="micro flex items-center gap-1 text-faint">
          <span>Density</span>
          <Select
            aria-label="Density"
            className="w-36"
            value={density}
            onChange={(event) => dispatch({ type: 'SET_DENSITY', density: event.target.value as Density })}
          >
            {DENSITIES.map((item) => (
              <option key={item} value={item}>{DENSITY_LABELS[item]}</option>
            ))}
          </Select>
        </label>
        <div className="relative">
          <Button onClick={() => setOpen((value) => !value)} aria-expanded={open}>Columns</Button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="shadow-dropdown absolute right-0 z-30 mt-1 w-44 rounded-[2px] border border-line bg-surface py-1">
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
