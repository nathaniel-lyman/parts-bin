import { useMemo, useState } from 'react'
import {
  AppliedFiltersBar,
  AssigneeChip,
  AttachmentList,
  AvatarGroup,
  Button,
  Checkbox,
  Combobox,
  CommandPalette,
  DateRangePicker,
  Drawer,
  Dropzone,
  Field,
  FacetedFilter,
  IconButton,
  ImportProgress,
  InlineAlert,
  Input,
  Pagination,
  RadioGroup,
  SegmentedControl,
  Spinner,
  Stepper,
  Switch,
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
  { value: 'starter', label: 'Starter', description: 'Up to 3 seats and the core dashboards.' },
  { value: 'pro', label: 'Pro', description: 'Saved views, export, and server-mode data.' },
  { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit log, and priority support.' },
]

const segmentFilterOptions = [
  { value: 'enterprise', label: 'Enterprise', count: 12 },
  { value: 'midmarket', label: 'Mid-market', count: 24 },
  { value: 'startup', label: 'Startup', count: 31 },
]

const importWizardSteps = [
  { id: 'upload', label: 'Upload CSV', state: 'complete' as const },
  { id: 'map', label: 'Map columns', state: 'current' as const },
  { id: 'review', label: 'Review', state: 'upcoming' as const },
]

const avatarUsers = [
  { name: 'Avery Cohen', status: 'online' as const },
  { name: 'Blair Nakamura', status: 'away' as const },
  { name: 'Devin Okafor', status: 'offline' as const },
  { name: 'Rowan Mitchell', status: 'busy' as const },
]

export function CommandPaletteDemo() {
  const [commandResult, setCommandResult] = useState('No command run')
  const docsCommandGroups = useMemo<CommandPaletteGroup[]>(() => [
    {
      id: 'navigation',
      label: 'Navigation',
      items: [
        { id: 'dashboard', label: 'Open dashboard', description: 'Go to the account book', onSelect: () => setCommandResult('Dashboard command') },
        { id: 'catalog', label: 'Open component catalog', description: 'Stay on this reference', onSelect: () => setCommandResult('Catalog command') },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      items: [
        { id: 'risk', label: 'Show risk focus', description: 'Filter the workspace to risk signals', shortcut: 'R', onSelect: () => setCommandResult('Risk command') },
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
  const [selectedSegments, setSelectedSegments] = useState(['enterprise'])
  const appliedFilters = selectedSegments.map((segment) => ({
    id: segment,
    label: 'Segment',
    value: segmentFilterOptions.find((option) => option.value === segment)?.label ?? segment,
    onRemove: () => setSelectedSegments((current) => current.filter((value) => value !== segment)),
  }))
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FacetedFilter
        label="Segment"
        options={segmentFilterOptions}
        selectedValues={selectedSegments}
        onSelectedValuesChange={setSelectedSegments}
      />
      <AppliedFiltersBar
        filters={appliedFilters}
        onClearAll={() => setSelectedSegments([])}
        className="flex-1"
      />
    </div>
  )
}

export function ComboboxDemo() {
  const [owner, setOwner] = useState('')
  return (
    <div className="grid gap-2">
      <Field label="Account owner" hint="Type to filter, then pick from the list.">
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
      label="Include churned accounts"
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
            <Field label="View name"><Input placeholder="At-risk enterprise" /></Field>
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  return (
    <div className="grid gap-3">
      <Stepper steps={importWizardSteps} currentStepId="map" />
      <Dropzone onFilesSelected={setUploadedFiles} label="Drop CSV files here" description="Choose a customer import file." />
      <AttachmentList
        attachments={uploadedFiles.length > 0
          ? uploadedFiles.map((file) => ({ id: file.name, name: file.name, size: file.size }))
          : [{ id: 'sample', name: 'accounts-import.csv', size: 14336, status: 'Ready' }]}
      />
      <ImportProgress value={64} detail="Mapping 3 of 5 columns." />
      <div className="flex flex-wrap items-center gap-3">
        <AvatarGroup users={avatarUsers} max={3} />
        <AssigneeChip name="Blair Nakamura" status="away" meta="Reviewer" />
      </div>
    </div>
  )
}

export function DropzoneDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  return (
    <div className="grid gap-3">
      <Dropzone onFilesSelected={setUploadedFiles} label="Drop CSV files here" description="Choose a customer import file." />
      <AttachmentList
        attachments={uploadedFiles.length > 0
          ? uploadedFiles.map((file) => ({ id: file.name, name: file.name, size: file.size }))
          : [{ id: 'sample', name: 'accounts-import.csv', size: 14336, status: 'Ready' }]}
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
        valueLabel="accounts"
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
