import { useMemo, useState } from 'react'
import { Columns3, Filter, Group, Settings2, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { isLockPositionColumn } from './normalize'
import { DENSITIES, DENSITY_LABELS } from './types'
import type { ColumnFiltersState } from '@tanstack/react-table'
import type { ColumnPinning, DataGridColumn, Density, GridAction } from './types'

type ToolPanelTab = 'columns' | 'filters' | 'groups' | 'view'

const tabs: { id: ToolPanelTab; label: string; icon: typeof Columns3 }[] = [
  { id: 'columns', label: 'Columns', icon: Columns3 },
  { id: 'filters', label: 'Filters', icon: Filter },
  { id: 'groups', label: 'Groups', icon: Group },
  { id: 'view', label: 'View', icon: Settings2 },
]

interface DataGridToolPanelProps<TData> {
  open: boolean
  onClose: () => void
  columns: Pick<DataGridColumn<TData>, 'id' | 'header' | 'hideable' | 'groupable' | 'pinnable' | 'type' | 'lockPosition'>[]
  columnVisibility: Record<string, boolean>
  columnPinning: ColumnPinning
  columnFilters: ColumnFiltersState
  globalFilter: string
  quickFilterPlaceholder?: string
  enableQuickFilter?: boolean
  density: Density
  grouping?: string[]
  enableGrouping?: boolean
  enableHeaderFilters?: boolean
  headerFiltersOpen?: boolean
  savedViews?: { id: string; name: string }[]
  dispatch: (action: GridAction) => void
  onToggleHeaderFilters?: () => void
  onApplyView?: (id: string) => void
  onSaveView?: (name: string) => void
  onDeleteView?: (id: string) => void
  onResetView?: () => void
}

function headerLabel<TData>(
  columns: Pick<DataGridColumn<TData>, 'id' | 'header'>[],
  id: string,
): string {
  const column = columns.find((item) => item.id === id)
  return typeof column?.header === 'string' && column.header ? column.header : id
}

function filterValueLabel(value: unknown): string {
  if (!value || typeof value !== 'object') return String(value ?? '')
  const filter = value as { operator?: string; value?: unknown; conjunction?: string; condition2?: { operator?: string; value?: unknown } }
  const first = `${filter.operator ?? 'filter'} ${Array.isArray(filter.value) ? filter.value.join(' to ') : String(filter.value ?? '')}`.trim()
  if (!filter.condition2) return first
  const second = `${filter.condition2.operator ?? 'filter'} ${Array.isArray(filter.condition2.value) ? filter.condition2.value.join(' to ') : String(filter.condition2.value ?? '')}`.trim()
  return `${first} ${(filter.conjunction ?? 'and').toUpperCase()} ${second}`
}

export function DataGridToolPanel<TData>({
  open,
  onClose,
  columns,
  columnVisibility,
  columnPinning,
  columnFilters,
  globalFilter,
  quickFilterPlaceholder = 'Search rows...',
  enableQuickFilter = true,
  density,
  grouping = [],
  enableGrouping,
  enableHeaderFilters,
  headerFiltersOpen,
  savedViews,
  dispatch,
  onToggleHeaderFilters,
  onApplyView,
  onSaveView,
  onDeleteView,
  onResetView,
}: DataGridToolPanelProps<TData>) {
  const [activeTab, setActiveTab] = useState<ToolPanelTab>('columns')
  const [columnSearch, setColumnSearch] = useState('')
  const [draftName, setDraftName] = useState('')
  const needle = columnSearch.trim().toLowerCase()
  const manageableColumns = useMemo(
    () => columns.filter((column) => !isLockPositionColumn(column)),
    [columns],
  )
  const visibleColumns = useMemo(
    () => manageableColumns.filter((column) => {
      if (!needle) return true
      return headerLabel(columns, column.id).toLowerCase().includes(needle) || column.id.toLowerCase().includes(needle)
    }),
    [columns, manageableColumns, needle],
  )
  const groupableColumns = manageableColumns.filter((column) => column.groupable === true)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <section
        className="shadow-dropdown fixed bottom-4 right-4 top-20 z-40 grid w-[min(420px,calc(100vw-2rem))] grid-rows-[auto_1fr] overflow-hidden rounded-md border border-line bg-surface"
        aria-label="DataGrid tools"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Settings2 aria-hidden="true" className="h-4 w-4 text-muted" />
            <span className="text-[14px] font-semibold text-ink">Grid tools</span>
          </div>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close grid tools"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="grid min-h-0 grid-cols-[132px_minmax(0,1fr)]">
          <div className="border-r border-line bg-surface-2 p-2" role="tablist" aria-label="Grid tool sections">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const selected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`mb-1 flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-[14px] ${selected ? 'bg-surface text-ink shadow-card' : 'text-muted hover:bg-surface hover:text-ink'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="min-h-0 overflow-auto p-3">
            {activeTab === 'columns' && (
              <div className="grid gap-3">
                <Input
                  type="search"
                  aria-label="Search columns"
                  placeholder="Search columns..."
                  value={columnSearch}
                  onChange={(event) => setColumnSearch(event.target.value)}
                />
                <div className="grid gap-1.5">
                  {visibleColumns.map((column) => {
                    const label = headerLabel(columns, column.id)
                    const pinSide = columnPinning.left.includes(column.id)
                      ? 'left'
                      : columnPinning.right.includes(column.id)
                        ? 'right'
                        : false
                    return (
                      <div key={column.id} className="grid gap-1 rounded-sm border border-line p-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex min-w-0 items-center gap-2 text-[14px] text-ink">
                            <input
                              type="checkbox"
                              className="accent-accent"
                              aria-label={label}
                              checked={columnVisibility[column.id] ?? true}
                              disabled={column.hideable === false}
                              onChange={() => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', id: column.id })}
                            />
                            <span className="truncate">{label}</span>
                          </label>
                          {pinSide && <span className="micro shrink-0 text-accent">Pinned {pinSide}</span>}
                        </div>
                        {column.pinnable !== false && (
                          <div className="flex flex-wrap gap-1">
                            <Button size="compact" variant="ghost" onClick={() => dispatch({ type: 'PIN_COLUMN', id: column.id, side: 'left' })}>Pin left</Button>
                            <Button size="compact" variant="ghost" onClick={() => dispatch({ type: 'PIN_COLUMN', id: column.id, side: 'right' })}>Pin right</Button>
                            <Button size="compact" variant="ghost" disabled={!pinSide} onClick={() => dispatch({ type: 'UNPIN_COLUMN', id: column.id })}>Unpin</Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {visibleColumns.length === 0 && <div className="text-[14px] text-muted">No columns match.</div>}
                </div>
                <Button size="compact" variant="ghost" onClick={() => dispatch({ type: 'RESET_COLUMNS' })}>Reset columns</Button>
              </div>
            )}
            {activeTab === 'filters' && (
              <div className="grid gap-3">
                {enableQuickFilter && (
                  <Input
                    type="search"
                    aria-label="Tool panel quick filter"
                    placeholder={quickFilterPlaceholder}
                    value={globalFilter}
                    onChange={(event) => dispatch({ type: 'SET_GLOBAL_FILTER', value: event.target.value })}
                  />
                )}
                {enableHeaderFilters && (
                  <Button
                    size="compact"
                    variant={headerFiltersOpen ? 'primary' : 'secondary'}
                    aria-pressed={headerFiltersOpen}
                    onClick={onToggleHeaderFilters}
                  >
                    Header filters
                  </Button>
                )}
                <div className="grid gap-1.5">
                  <div className="micro text-faint">Active column filters</div>
                  {columnFilters.length === 0 ? (
                    <div className="text-[14px] text-muted">No column filters.</div>
                  ) : columnFilters.map((filter) => (
                    <div key={filter.id} className="flex items-center justify-between gap-2 rounded-sm border border-line px-2 py-1.5">
                      <div className="min-w-0">
                        <div className="text-[14px] text-ink">{headerLabel(columns, filter.id)}</div>
                        <div className="micro truncate text-muted">{filterValueLabel(filter.value)}</div>
                      </div>
                      <Button size="compact" variant="ghost" onClick={() => dispatch({ type: 'CLEAR_COLUMN_FILTER', columnId: filter.id })}>Clear</Button>
                    </div>
                  ))}
                </div>
                <Button
                  size="compact"
                  variant="ghost"
                  disabled={!globalFilter && columnFilters.length === 0}
                  onClick={() => {
                    dispatch({ type: 'SET_GLOBAL_FILTER', value: '' })
                    dispatch({ type: 'SET_COLUMN_FILTERS', columnFilters: [] })
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
            {activeTab === 'groups' && (
              <div className="grid gap-3">
                {!enableGrouping ? (
                  <div className="text-[14px] text-muted">Grouping is not enabled for this grid.</div>
                ) : (
                  <>
                    <div className="grid gap-1.5">
                      {groupableColumns.map((column) => {
                        const label = headerLabel(columns, column.id)
                        return (
                          <label key={column.id} className="flex items-center gap-2 rounded-sm border border-line px-2 py-1.5 text-[14px] text-ink">
                            <input
                              type="checkbox"
                              className="accent-accent"
                              aria-label={`Group by ${label}`}
                              checked={grouping.includes(column.id)}
                              onChange={() => dispatch({ type: 'TOGGLE_GROUP_BY', columnId: column.id })}
                            />
                            {label}
                          </label>
                        )
                      })}
                      {groupableColumns.length === 0 && <div className="text-[14px] text-muted">No groupable columns.</div>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button size="compact" variant="ghost" onClick={() => dispatch({ type: 'EXPAND_ALL' })}>Expand all</Button>
                      <Button size="compact" variant="ghost" onClick={() => dispatch({ type: 'COLLAPSE_ALL' })}>Collapse all</Button>
                      <Button size="compact" variant="ghost" disabled={grouping.length === 0} onClick={() => dispatch({ type: 'CLEAR_GROUPING' })}>Clear grouping</Button>
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 'view' && (
              <div className="grid gap-3">
                <label className="grid gap-1 text-[14px] text-ink">
                  <span className="micro text-faint">Density</span>
                  <Select
                    aria-label="Tool panel density"
                    value={density}
                    onChange={(event) => dispatch({ type: 'SET_DENSITY', density: event.target.value as Density })}
                  >
                    {DENSITIES.map((item) => (
                      <option key={item} value={item}>{DENSITY_LABELS[item]}</option>
                    ))}
                  </Select>
                </label>
                {savedViews && (
                  <div className="grid gap-2">
                    <div className="micro text-faint">Saved views</div>
                    {savedViews.length === 0 ? (
                      <div className="text-[14px] text-muted">No saved views.</div>
                    ) : savedViews.map((view) => (
                      <div key={view.id} className="flex items-center gap-1">
                        <Button className="min-w-0 flex-1 justify-start" size="compact" variant="ghost" aria-label={`Apply ${view.name}`} onClick={() => onApplyView?.(view.id)}>
                          <span className="truncate">{view.name}</span>
                        </Button>
                        <Button size="compact" variant="ghost" aria-label={`Delete ${view.name}`} onClick={() => onDeleteView?.(view.id)}>Delete</Button>
                      </div>
                    ))}
                    <Input
                      placeholder="View name"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                    />
                    <div className="flex flex-wrap gap-1">
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
                      <Button size="compact" variant="ghost" onClick={onResetView}>Reset to default</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
