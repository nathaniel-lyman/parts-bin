import { useMemo, useState } from 'react'
import {
  DataGrid,
  DEFAULT_STATE,
  toGridQuery,
  type DataGridColumn,
  type GridQuery,
} from '../DataGrid'
import { useServerData } from '../../hooks/useServerData'
import { createMemoryServerAdapter } from '../DataGrid/memoryServerAdapter'
import {
  Accordion,
  AppliedFiltersBar,
  AttachmentList,
  Banner,
  Button,
  Checkbox,
  Combobox,
  CommandPalette,
  ContextMenu,
  DateRangePicker,
  Drawer,
  Dropzone,
  Field,
  FacetedFilter,
  IconButton,
  InlineAlert,
  Input,
  Kbd,
  Pagination,
  RadioGroup,
  SegmentedControl,
  MultiSelect,
  Progress,
  Slider,
  Spinner,
  Stepper,
  Switch,
  Table,
  Tag,
  type CommandPaletteGroup,
  type DateRange,
} from '../ui'
import { BubbleMap, FlowMap, ledgerFlows, ledgerPoints, ledgerRegions, type MapFlow, type MapPoint } from '../maps'

const ownerOptions = [
  { value: 'avery', label: 'Avery Cohen' },
  { value: 'blair', label: 'Blair Nakamura' },
  { value: 'devin', label: 'Devin Okafor' },
  { value: 'rowan', label: 'Rowan Mitchell' },
  { value: 'sasha', label: 'Sasha Delgado' },
]

const planOptions = [
  { value: 'starter', label: 'Starter', description: 'Core workflow screens and local state.' },
  { value: 'pro', label: 'Pro', description: 'Saved views, export, and server-mode data.' },
  { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit log, and priority support.' },
]

const categoryFilterOptions = [
  { value: 'design', label: 'Design', count: 12 },
  { value: 'engineering', label: 'Engineering', count: 24 },
  { value: 'operations', label: 'Operations', count: 31 },
]

const importWizardSteps = [
  { id: 'upload', label: 'Upload CSV', state: 'complete' as const },
  { id: 'map', label: 'Map columns', state: 'current' as const },
  { id: 'review', label: 'Review', state: 'upcoming' as const },
]

type DataGridDemoMode = 'server' | 'tree' | 'detail'

interface DataGridDemoRow {
  id: string
  item: string
  owner: string
  stage: 'Discovery' | 'Build' | 'Review' | 'Launch'
  impact: number
  children?: DataGridDemoRow[]
}

const dataGridDemoRows: DataGridDemoRow[] = [
  {
    id: 'platform',
    item: 'Platform rollout',
    owner: 'Avery Cohen',
    stage: 'Build',
    impact: 84,
    children: [
      { id: 'platform-api', item: 'API adapter', owner: 'Devin Okafor', stage: 'Review', impact: 72 },
      { id: 'platform-docs', item: 'Docs migration', owner: 'Rowan Mitchell', stage: 'Build', impact: 64 },
    ],
  },
  {
    id: 'imports',
    item: 'Import workflow',
    owner: 'Blair Nakamura',
    stage: 'Discovery',
    impact: 58,
    children: [
      { id: 'imports-map', item: 'Column mapping', owner: 'Sasha Delgado', stage: 'Build', impact: 69 },
    ],
  },
  { id: 'analytics', item: 'Analytics handoff', owner: 'Devin Okafor', stage: 'Launch', impact: 91 },
  { id: 'permissions', item: 'Permission review', owner: 'Avery Cohen', stage: 'Review', impact: 77 },
]

const flatDataGridDemoRows = dataGridDemoRows.flatMap((row) => [row, ...(row.children ?? [])])

const dataGridDemoColumns: DataGridColumn<DataGridDemoRow>[] = [
  { id: 'item', accessorKey: 'item', header: 'Work item', type: 'text', editable: true, width: 190 },
  { id: 'owner', accessorKey: 'owner', header: 'Owner', type: 'text', editable: true, width: 160 },
  {
    id: 'stage',
    accessorKey: 'stage',
    header: 'Stage',
    type: 'status',
    editable: true,
    groupable: true,
    meta: { options: ['Discovery', 'Build', 'Review', 'Launch'] },
    width: 130,
  },
  { id: 'impact', accessorKey: 'impact', header: 'Impact', type: 'number', editable: true, aggregate: 'avg', width: 110 },
]

const dataGridDemoInitialState = {
  ...DEFAULT_STATE,
  pagination: { pageIndex: 0, pageSize: 3 },
  columnSizing: { item: 190, owner: 160, stage: 130, impact: 110 },
}

function updateDataGridDemoRows(rows: DataGridDemoRow[], rowId: string, patch: Partial<DataGridDemoRow>): DataGridDemoRow[] {
  return rows.map((row) => {
    if (row.id === rowId) return { ...row, ...patch }
    if (!row.children) return row
    return { ...row, children: updateDataGridDemoRows(row.children, rowId, patch) }
  })
}

export function CommandPaletteDemo() {
  const [commandResult, setCommandResult] = useState('No command run')
  const docsCommandGroups = useMemo<CommandPaletteGroup[]>(() => [
    {
      id: 'navigation',
      label: 'Navigation',
      items: [
        { id: 'catalog', label: 'Open component catalog', description: 'Stay on this reference', onSelect: () => setCommandResult('Catalog command') },
        { id: 'assembly', label: 'Open assembly demo', description: 'Go to the sample component assembly', onSelect: () => setCommandResult('Assembly command') },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      items: [
        { id: 'review', label: 'Show review focus', description: 'Filter the workspace to rows needing review', shortcut: 'R', onSelect: () => setCommandResult('Review command') },
      ],
    },
  ], [])

  return (
    <div className="grid gap-2">
      <CommandPalette groups={docsCommandGroups} />
      <p className="m-0 text-[13px] text-muted">
        Command result: <code className="num text-ink">{commandResult}</code>
      </p>
    </div>
  )
}

export function DateRangePickerDemo() {
  const [docsDateRange, setDocsDateRange] = useState<DateRange>({ start: '2026-06-01', end: '2026-06-08' })
  return (
    <DateRangePicker
      label="Dates"
      value={docsDateRange}
      onValueChange={setDocsDateRange}
      presets={[
        { id: 'june', label: 'June 2026', range: { start: '2026-06-01', end: '2026-06-30' } },
        { id: 'q2', label: 'Q2 2026', range: { start: '2026-04-01', end: '2026-06-30' } },
      ]}
    />
  )
}

export function FacetedFilterDemo() {
  const [selectedCategories, setSelectedCategories] = useState(['design'])
  const appliedFilters = selectedCategories.map((category) => ({
    id: category,
    label: 'Category',
    value: categoryFilterOptions.find((option) => option.value === category)?.label ?? category,
    onRemove: () => setSelectedCategories((current) => current.filter((value) => value !== category)),
  }))
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FacetedFilter
        label="Category"
        options={categoryFilterOptions}
        selectedValues={selectedCategories}
        onSelectedValuesChange={setSelectedCategories}
      />
      <AppliedFiltersBar
        filters={appliedFilters}
        onClearAll={() => setSelectedCategories([])}
        className="flex-1"
      />
    </div>
  )
}

export function ComboboxDemo() {
  const [owner, setOwner] = useState('')
  return (
    <div className="grid gap-2">
      <Field label="Record owner" hint="Type to filter, then pick from the list.">
        <Combobox options={ownerOptions} value={owner} onValueChange={setOwner} placeholder="Search owners…" />
      </Field>
      <p className="m-0 text-[13px] text-muted">Owner: <code className="num text-ink">{owner || '—'}</code></p>
    </div>
  )
}

export function RadioGroupDemo() {
  const [plan, setPlan] = useState('pro')
  return (
    <div className="grid gap-2">
      <RadioGroup label="Plan" options={planOptions} value={plan} onValueChange={setPlan} />
      <p className="m-0 text-[13px] text-muted">Plan: <code className="num text-ink">{plan}</code></p>
    </div>
  )
}

export function CheckboxDemo() {
  const [checked, setChecked] = useState(true)
  return (
    <Checkbox
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
      label="Include archived rows"
      hint="Good for reporting screens."
    />
  )
}

export function SwitchDemo() {
  const [switchOn, setSwitchOn] = useState(true)
  return (
    <Switch
      checked={switchOn}
      onChange={(event) => setSwitchOn(event.target.checked)}
      label="Server mode"
      hint="Use role switch for binary system settings."
    />
  )
}

export function SegmentedControlDemo() {
  const [density, setDensity] = useState('standard')
  return (
    <div className="grid gap-2">
      <SegmentedControl
        label="Row density"
        value={density}
        onValueChange={setDensity}
        options={[
          { value: 'compact', label: 'Compact' },
          { value: 'standard', label: 'Standard' },
          { value: 'comfortable', label: 'Comfortable' },
        ]}
      />
      <p className="m-0 text-[13px] text-muted">Selected density: <code className="num text-ink">{density}</code></p>
    </div>
  )
}

export function InlineAlertDemo() {
  const [warnAlertOpen, setWarnAlertOpen] = useState(true)
  return (
    <div className="grid gap-2">
      {warnAlertOpen && (
        <InlineAlert tone="warn" title="Two columns are hidden" onDismiss={() => setWarnAlertOpen(false)}>
          Reset the view to show every column again.
        </InlineAlert>
      )}
      <InlineAlert tone="pos">Saved view applied.</InlineAlert>
      <InlineAlert tone="neg" title="Sync failed">Retry the import to continue.</InlineAlert>
    </div>
  )
}

export function DrawerDemo() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return (
    <div>
      <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
      {drawerOpen && (
        <Drawer
          title="Saved views"
          onClose={() => setDrawerOpen(false)}
          footer={<Button variant="primary" onClick={() => setDrawerOpen(false)}>Done</Button>}
        >
          <div className="grid gap-3 text-[13px] text-muted">
            <p className="m-0">Drawers reuse the Modal focus trap: Escape closes, Tab cycles inside, and focus returns to the opener.</p>
            <Field label="View name"><Input placeholder="Review queue" /></Field>
          </div>
        </Drawer>
      )}
    </div>
  )
}

export function SpinnerDemo() {
  const [saving, setSaving] = useState(false)
  const simulateSave = () => {
    setSaving(true)
    window.setTimeout(() => setSaving(false), 1200)
  }
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" loading={saving} onClick={simulateSave}>Save changes</Button>
        <Button loading={saving}>Secondary</Button>
        <IconButton aria-label="Refresh" loading={saving}>↻</IconButton>
      </div>
      <div className="flex items-center gap-3 text-[13px] text-muted">
        <Spinner size="sm" label="" />
        <Spinner label="" />
        <Spinner size="lg" label="" />
        <span>Inline spinners inherit the current text color, so they re-skin for free.</span>
      </div>
    </div>
  )
}

export function PaginationDemo() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} pageSize={25} total={118} onPageChange={setPage} />
}

export function StepperDemo() {
  return <Stepper steps={importWizardSteps} currentStepId="map" />
}

export function DropzoneDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  return (
    <div className="grid gap-3">
      <Dropzone onFilesSelected={setUploadedFiles} label="Drop CSV files here" description="Choose a customer import file." />
      <AttachmentList
        attachments={uploadedFiles.length > 0
          ? uploadedFiles.map((file) => ({ id: file.name, name: file.name, size: file.size }))
          : [{ id: 'sample', name: 'records-import.csv', size: 14336, status: 'Ready' }]}
      />
    </div>
  )
}

export function BubbleMapDemo() {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint>(ledgerPoints[1])
  return (
    <div className="grid gap-2">
      <BubbleMap
        points={ledgerPoints}
        regions={ledgerRegions}
        selectedPointId={selectedPoint.id}
        onPointSelect={setSelectedPoint}
        valueLabel="records"
      />
      <p className="m-0 text-[13px] text-muted">Selected: <code className="num text-ink">{selectedPoint.label} · {selectedPoint.value}</code></p>
    </div>
  )
}

export function FlowMapDemo() {
  const [selectedFlow, setSelectedFlow] = useState<MapFlow>(ledgerFlows[0])
  return (
    <div className="grid gap-2">
      <FlowMap
        flows={ledgerFlows}
        regions={ledgerRegions}
        selectedFlowId={selectedFlow.id}
        onFlowSelect={setSelectedFlow}
        valueLabel="pipeline"
      />
      <p className="m-0 text-[13px] text-muted">Selected: <code className="num text-ink">{selectedFlow.label} · {selectedFlow.value}</code></p>
    </div>
  )
}

export function TableDemo() {
  return (
    <Table
      caption="Top projects by score"
      columns={[
        { key: 'name', header: 'Project' },
        { key: 'owner', header: 'Owner' },
        { key: 'score', header: 'Score', numeric: true },
      ]}
      rows={[
        { id: 'a', name: 'Launch plan', owner: 'Avery Cohen', score: 82 },
        { id: 'b', name: 'Vendor review', owner: 'Blair Nakamura', score: 64 },
        { id: 'c', name: 'Policy rollout', owner: 'Devin Okafor', score: 51 },
      ]}
      rowKey={(row) => row.id}
    />
  )
}

export function AccordionDemo() {
  return (
    <Accordion
      defaultOpenIds={['general']}
      items={[
        { id: 'general', title: 'General', content: 'Workspace name, locale, and default currency.' },
        { id: 'billing', title: 'Billing', content: 'Plan, payment method, and invoice history.' },
        { id: 'security', title: 'Security', content: 'SSO, session policy, and audit log retention.' },
      ]}
    />
  )
}

export function ProgressDemo() {
  return (
    <div className="grid gap-3">
      <Progress value={62} label="Storage" showValue />
      <Progress value={88} tone="warn" label="API quota" showValue />
      <Progress value={100} tone="pos" label="Import" showValue />
    </div>
  )
}

export function TagDemo() {
  const [tags, setTags] = useState(['Beta', 'Priority', 'EMEA'])
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <Tag key={tag} tone="accent" label={tag} onRemove={() => setTags((current) => current.filter((value) => value !== tag))} />
      ))}
      <Tag tone="neutral" label="read-only" />
      {tags.length < 3 && (
        <Button size="compact" variant="ghost" onClick={() => setTags(['Beta', 'Priority', 'EMEA'])}>Reset</Button>
      )}
    </div>
  )
}

export function MultiSelectDemo() {
  const [segments, setSegments] = useState(['design'])
  return (
    <div className="grid gap-2">
      <Field label="Categories" hint="Type to filter; Backspace removes the last token.">
        <MultiSelect
          options={categoryFilterOptions}
          values={segments}
          onValuesChange={setSegments}
          placeholder="Add categories…"
        />
      </Field>
      <p className="m-0 text-[13px] text-muted">Selected: <code className="num text-ink">{segments.join(', ') || '—'}</code></p>
    </div>
  )
}

export function BannerDemo() {
  const [visible, setVisible] = useState(true)
  if (!visible) {
    return <Button size="compact" variant="ghost" onClick={() => setVisible(true)}>Show banner again</Button>
  }
  return (
    <Banner tone="warn" action={<Button size="compact">Upgrade</Button>} onDismiss={() => setVisible(false)}>
      Trial ends in 3 days — upgrade to keep saved views.
    </Banner>
  )
}

export function ContextMenuDemo() {
  const [lastAction, setLastAction] = useState<string | null>(null)
  return (
    <div className="grid gap-2">
      <ContextMenu
        items={[
          { id: 'open', label: 'Open record', onSelect: () => setLastAction('Open record') },
          { id: 'rename', label: 'Rename', onSelect: () => setLastAction('Rename') },
          { id: 'archive', label: 'Archive', disabled: true },
          { id: 'delete', label: 'Delete', destructive: true, onSelect: () => setLastAction('Delete') },
        ]}
      >
        <div className="grid place-items-center border border-dashed border-line bg-surface-2 px-4 py-6 text-[13px] text-muted">
          Right-click this region
        </div>
      </ContextMenu>
      <p className="m-0 text-[13px] text-muted">Last action: <code className="num text-ink">{lastAction ?? '—'}</code></p>
    </div>
  )
}

export function SliderDemo() {
  const [threshold, setThreshold] = useState(60)
  return (
    <div className="grid max-w-72 gap-2">
      <Slider label="Review threshold" min={0} max={100} step={5} value={threshold} onValueChange={setThreshold} showValue formatValue={(v) => `${v}%`} />
      <p className="m-0 text-[13px] text-muted">Rows above <code className="num text-ink">{threshold}%</code> are flagged.</p>
    </div>
  )
}

export function KbdDemo() {
  return (
    <div className="flex items-center gap-4 text-[13px] text-muted">
      <span className="inline-flex items-center gap-1.5">Open palette <Kbd keys={['Ctrl', 'K']} /></span>
      <span className="inline-flex items-center gap-1.5">Save view <Kbd keys={['⌘', 'S']} /></span>
      <span className="inline-flex items-center gap-1.5">Dismiss <Kbd>Esc</Kbd></span>
    </div>
  )
}

export function DataGridDemo() {
  const [mode, setMode] = useState<DataGridDemoMode>('server')
  const [rows, setRows] = useState(dataGridDemoRows)
  const [allMatchingRowsSelected, setAllMatchingRowsSelected] = useState(false)
  const [serverAction, setServerAction] = useState('No server action')
  const [serverQuery, setServerQuery] = useState<GridQuery>(() => toGridQuery(dataGridDemoInitialState))
  const serverAdapter = useMemo(
    () => createMemoryServerAdapter(flatDataGridDemoRows, { columns: dataGridDemoColumns, latencyMs: 100 }),
    [],
  )
  const server = useServerData(serverAdapter, serverQuery, { enabled: mode === 'server', debounceMs: 80 })
  const isServerMode = mode === 'server'
  const gridRows = isServerMode ? server.rows : rows

  return (
    <div className="grid gap-3">
      <SegmentedControl
        label="DataGrid mode"
        value={mode}
        onValueChange={(value) => {
          setMode(value as DataGridDemoMode)
          setAllMatchingRowsSelected(false)
        }}
        options={[
          { value: 'server', label: 'Server' },
          { value: 'tree', label: 'Tree' },
          { value: 'detail', label: 'Detail' },
        ]}
      />
      <div className="max-h-[520px] overflow-auto border border-line bg-surface">
        <DataGrid<DataGridDemoRow>
          key={mode}
          rows={gridRows}
          columns={dataGridDemoColumns}
          getRowId={(row) => row.id}
          initialState={dataGridDemoInitialState}
          enableRowSelection
          enableExport
          enableExcelExport
          enableSavedViews={!isServerMode}
          enableGrouping={!isServerMode}
          exportFilename="data-grid-demo.csv"
          manualSorting={isServerMode}
          manualFiltering={isServerMode}
          manualPagination={isServerMode}
          totalRowCount={isServerMode ? server.totalRowCount : undefined}
          loading={isServerMode && server.status === 'loading'}
          error={isServerMode && server.status === 'error' ? server.error : undefined}
          onQueryChange={isServerMode ? setServerQuery : undefined}
          allMatchingRowsSelected={isServerMode && allMatchingRowsSelected}
          onSelectAllMatching={isServerMode
            ? (query) => {
                setAllMatchingRowsSelected(true)
                setServerAction(`Selected ${query.scope} rows`)
              }
            : undefined}
          onClearAllMatching={isServerMode
            ? () => {
                setAllMatchingRowsSelected(false)
                setServerAction('Cleared server selection')
              }
            : undefined}
          onExportAllCsv={isServerMode ? (query) => setServerAction(`Exported ${query.scope} CSV`) : undefined}
          onExportAllXlsx={isServerMode ? (query) => setServerAction(`Exported ${query.scope} Excel`) : undefined}
          getSubRows={mode === 'tree' ? (row) => row.children : undefined}
          getRowCanExpand={mode === 'detail' ? () => true : undefined}
          renderDetailPanel={mode === 'detail'
            ? ({ row }) => (
                <div className="grid gap-1 text-[13px] text-muted">
                  <p className="m-0 text-ink">{row.item}</p>
                  <p className="m-0">Owned by {row.owner}; current stage is {row.stage}.</p>
                </div>
              )
            : undefined}
          treeColumnId="item"
          onRowUpdate={!isServerMode
            ? (rowId, patch) => setRows((current) => updateDataGridDemoRows(current, rowId, patch))
            : undefined}
        />
      </div>
      <p className="m-0 text-[13px] text-muted">
        {isServerMode
          ? `Manual sorting, filtering, pagination, query-wide selection, and export flow through the generic data-source contract. ${serverAction}.`
          : 'Editable cells, range copy/paste, row pinning, grouping with custom summaries, tree rows, and detail panels stay client-side.'}
      </p>
    </div>
  )
}
