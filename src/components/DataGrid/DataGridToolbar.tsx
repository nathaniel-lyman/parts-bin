import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { DataGridToolPanel } from './DataGridToolPanel'
import type { ColumnFiltersState } from '@tanstack/react-table'
import type { ColumnPinning, Density, GridAction, DataGridColumn } from './types'

interface Props<TData> {
  columns: Pick<DataGridColumn<TData>, 'id' | 'header' | 'hideable' | 'groupable' | 'pinnable' | 'type' | 'lockPosition'>[]
  columnVisibility: Record<string, boolean>
  columnPinning?: ColumnPinning
  columnFilters?: ColumnFiltersState
  globalFilter: string
  quickFilterPlaceholder?: string
  enableQuickFilter?: boolean
  density: Density
  grouping?: string[]
  enableGrouping?: boolean
  dispatch: (action: GridAction) => void
  enableExport?: boolean
  enableHeaderFilters?: boolean
  headerFiltersOpen?: boolean
  onToggleHeaderFilters?: () => void
  onExportCsv?: () => void
  onExportXlsx?: () => void
  onExportAllCsv?: () => void
  onExportAllXlsx?: () => void
  savedViews?: { id: string; name: string }[]
  onApplyView?: (id: string) => void
  onSaveView?: (name: string) => void
  onDeleteView?: (id: string) => void
  onResetView?: () => void
}

export function DataGridToolbar<TData>({
  columns,
  columnVisibility,
  columnPinning = { left: [], right: [] },
  columnFilters = [],
  globalFilter,
  quickFilterPlaceholder = 'Search rows...',
  enableQuickFilter = true,
  density,
  grouping = [],
  enableGrouping,
  dispatch,
  enableExport,
  enableHeaderFilters,
  headerFiltersOpen,
  onToggleHeaderFilters,
  onExportCsv,
  onExportXlsx,
  onExportAllCsv,
  onExportAllXlsx,
  savedViews,
  onApplyView,
  onSaveView,
  onDeleteView,
  onResetView,
}: Props<TData>) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const headerFor = (id: string) => {
    const column = columns.find((item) => item.id === id)
    return typeof column?.header === 'string' && column.header ? column.header : id
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
      {enableQuickFilter && (
        <Input
          type="search"
          className="max-w-sm"
          placeholder={quickFilterPlaceholder}
          aria-label="Quick filter"
          value={globalFilter}
          onChange={(event) => dispatch({ type: 'SET_GLOBAL_FILTER', value: event.target.value })}
        />
      )}
      {enableGrouping && grouping.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" data-testid="grouping-chips">
          <span className="micro text-faint">Grouped by</span>
          {grouping.map((id) => (
            <span
              key={id}
              className="micro flex items-center gap-1 rounded-pill bg-accent-soft px-1.5 py-0.5 text-accent"
            >
              {headerFor(id)}
              <button
                type="button"
                aria-label={`Remove grouping by ${headerFor(id)}`}
                className="inline-flex h-3.5 w-3.5 items-center justify-center hover:text-ink"
                onClick={() => dispatch({ type: 'TOGGLE_GROUP_BY', columnId: id })}
              >
                <X aria-hidden="true" className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="micro text-muted hover:text-ink"
            onClick={() => dispatch({ type: 'EXPAND_ALL' })}
          >
            Expand all
          </button>
          <button
            type="button"
            className="micro text-muted hover:text-ink"
            onClick={() => dispatch({ type: 'COLLAPSE_ALL' })}
          >
            Collapse all
          </button>
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
        {enableExport && onExportXlsx && (
          <Button size="compact" onClick={onExportXlsx} aria-label="Export Excel">
            Export Excel
          </Button>
        )}
        {enableExport && onExportAllCsv && (
          <Button size="compact" onClick={onExportAllCsv} aria-label="Export all CSV">
            Export all CSV
          </Button>
        )}
        {enableExport && onExportAllXlsx && (
          <Button size="compact" onClick={onExportAllXlsx} aria-label="Export all Excel">
            Export all Excel
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
        <div className="relative">
          <Button onClick={() => setToolsOpen((value) => !value)} aria-expanded={toolsOpen} aria-label="Grid tools">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Tools
          </Button>
          <DataGridToolPanel
            open={toolsOpen}
            onClose={() => setToolsOpen(false)}
            columns={columns}
            columnVisibility={columnVisibility}
            columnPinning={columnPinning}
            columnFilters={columnFilters}
            globalFilter={globalFilter}
            quickFilterPlaceholder={quickFilterPlaceholder}
            enableQuickFilter={enableQuickFilter}
            density={density}
            grouping={grouping}
            enableGrouping={enableGrouping}
            enableHeaderFilters={enableHeaderFilters}
            headerFiltersOpen={headerFiltersOpen}
            savedViews={savedViews}
            dispatch={dispatch}
            onToggleHeaderFilters={onToggleHeaderFilters}
            onApplyView={onApplyView}
            onSaveView={onSaveView}
            onDeleteView={onDeleteView}
            onResetView={onResetView}
          />
        </div>
      </div>
    </div>
  )
}
