import type { ReactNode } from 'react'
import {
  Accordion, ActivityFeed, AppliedFiltersBar, AssigneeChip, AttachmentList, AuditLogItem,
  Avatar, AvatarGroup, Banner, Button, Card, Checkbox, Combobox, DatePicker,
  DateRangePicker, DescriptionList, DetailHeader, Dropzone, EmptyState, FacetedFilter,
  Field, FileUpload, IconButton, ImportProgress, InlineAlert, Input, Kbd, KeyValueList,
  LoadingBars, LoadingChartDrawIn, LoadingConcentricArcs, LoadingDonut, LoadingDots,
  LoadingKpiSkeleton, LoadingProgress, LoadingSparkline, MetadataPanel, Metric,
  MultiSelect, Pagination, Progress, PropertyGrid, RadioGroup, SegmentedControl, Select,
  Skeleton, Slider, Spinner, StatusBadge, Stepper, Switch, Table, Tabs, Tag, Textarea,
  Timeline, Toolbar,
} from '../ui'
import { ChartCard, ChartEmptyState, ChartLegend, ChartTooltipContent } from '../charts'
import { NotificationBadge } from '../shell'
import { KpiCard } from '../KpiCard'
import { Sparkline } from '../Sparkline'

const noop = () => {}

/**
 * Static gallery thumbnails keyed by EXACT CATALOG name. Rendered non-interactive
 * (pointer-events-none + inert) inside GalleryCard, so fixed states + no-op handlers
 * are deliberate. Components without an entry get the placeholder tile.
 */
export const previews: Partial<Record<string, ReactNode>> = {
  // primitives
  Button: (
    <div className="flex gap-2">
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  ),
  IconButton: <IconButton aria-label="Edit">✎</IconButton>,
  Card: <Card title="Overview" description="Quarterly summary">Body content</Card>,
  StatusBadge: <StatusBadge status="Active" tone="pos" />,
  Tag: <Tag tone="accent" label="Beta" />,
  Kbd: <Kbd keys={['Ctrl', 'K']} />,
  // forms
  Input: <Input placeholder="Acme Corp" readOnly />,
  Textarea: <Textarea placeholder="Add a note…" rows={2} readOnly />,
  Select: (
    <Select defaultValue="smb" onChange={noop}>
      <option value="smb">SMB</option>
      <option value="ent">Enterprise</option>
    </Select>
  ),
  Checkbox: <Checkbox label="Email me" checked onChange={noop} />,
  RadioGroup: (
    <RadioGroup
      label="Plan"
      options={[{ value: 'starter', label: 'Starter' }, { value: 'pro', label: 'Pro' }]}
      value="pro"
      onValueChange={noop}
    />
  ),
  Switch: <Switch label="Dark mode" checked onChange={noop} />,
  SegmentedControl: (
    <SegmentedControl
      options={[{ value: 'compact', label: 'Compact' }, { value: 'standard', label: 'Standard' }]}
      value="standard"
      onValueChange={noop}
    />
  ),
  Slider: <Slider label="Risk threshold" min={0} max={100} defaultValue={60} showValue />,
  Field: (
    <Field label="Name" required>
      <Input placeholder="Cobalt Freight" readOnly />
    </Field>
  ),
  // feedback
  InlineAlert: <InlineAlert tone="warn" title="Heads up">Renewal is overdue.</InlineAlert>,
  Spinner: <Spinner size="sm" label="Loading" />,
  Skeleton: (
    <div className="grid w-32 gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  ),
  Progress: <div className="w-40"><Progress value={62} label="Storage" showValue /></div>,
  EmptyState: <EmptyState title="No accounts" description="Add your first account." />,
  // data display
  Avatar: <Avatar name="Avery Cohen" status="online" />,
  Metric: <Metric label="Churn" value="2.1%" delta="-0.3" status="positive" />,
  Pagination: <Pagination page={2} pageSize={25} total={240} onPageChange={noop} />,
  Sparkline: <div className="w-32"><Sparkline data={[1, 3, 2, 5, 4, 6]} /></div>,
  KeyValueList: <KeyValueList items={[{ label: 'Owner', value: 'Avery Cohen' }, { label: 'Plan', value: 'Pro' }]} />,
  Accordion: <div className="w-48"><Accordion items={[{ id: 'general', title: 'General', content: 'Workspace settings' }]} defaultOpenIds={['general']} /></div>,
  Tabs: <Tabs items={[{ id: 'a', label: 'Overview', content: null }, { id: 'b', label: 'Activity', content: null }]} defaultValue="a" />,
  // forms (batch 2) — pickers and dropdowns shown closed
  Combobox: (
    <div className="w-48">
      <Combobox
        options={[{ value: 'avery', label: 'Avery Cohen' }, { value: 'blair', label: 'Blair Nakamura' }]}
        value="avery"
        onValueChange={noop}
        placeholder="Owner"
      />
    </div>
  ),
  MultiSelect: (
    <div className="w-48">
      <MultiSelect
        options={[{ value: 'enterprise', label: 'Enterprise' }, { value: 'startup', label: 'Startup' }]}
        values={['enterprise']}
        onValuesChange={noop}
        placeholder="Segments"
      />
    </div>
  ),
  DatePicker: <div className="w-44"><DatePicker label="Renews" value="2026-06-09" onValueChange={noop} /></div>,
  DateRangePicker: (
    <div className="w-56">
      <DateRangePicker label="Period" value={{ start: '2026-06-01', end: '2026-06-30' }} onValueChange={noop} />
    </div>
  ),
  Dropzone: <div className="w-56"><Dropzone multiple onFilesSelected={noop} /></div>,
  FileUpload: (
    <div className="w-56">
      <FileUpload files={[new File(['ledger,accounts'], 'accounts-import.csv', { type: 'text/csv' })]} onFilesSelected={noop} />
    </div>
  ),
  Stepper: (
    <Stepper
      steps={[
        { id: 'upload', label: 'Upload', state: 'complete' },
        { id: 'map', label: 'Map', state: 'current' },
        { id: 'review', label: 'Review', state: 'upcoming' },
      ]}
      currentStepId="map"
    />
  ),
  // feedback (batch 2) — LoadingCountingMetric stays placeholder (drives itself with rAF/timeouts)
  Banner: <Banner tone="warn">Trial ends in 3 days.</Banner>,
  ImportProgress: <div className="w-56"><ImportProgress value={62} label="Importing" detail="124 of 200 rows" /></div>,
  LoadingBars: <LoadingBars label="Loading activity" />,
  LoadingChartDrawIn: <LoadingChartDrawIn label="Loading chart" />,
  LoadingConcentricArcs: <LoadingConcentricArcs label="Loading" />,
  LoadingDonut: <LoadingDonut label="Loading donut chart" tone="accent" />,
  LoadingDots: <LoadingDots label="Loading" />,
  LoadingKpiSkeleton: <LoadingKpiSkeleton label="Loading KPI" />,
  LoadingProgress: <div className="w-56"><LoadingProgress label="Syncing" detail="Syncing accounts" /></div>,
  LoadingSparkline: <LoadingSparkline label="Loading sparkline" />,
  // data display (batch 2)
  AvatarGroup: <AvatarGroup users={[{ name: 'Avery Cohen' }, { name: 'Blair Nakamura' }, { name: 'Devin Okafor' }]} max={3} />,
  AssigneeChip: <AssigneeChip name="Avery Cohen" />,
  AuditLogItem: (
    <div className="w-64">
      <AuditLogItem id="e1" title="Updated MRR" resource="Acme" actor="Avery" timestamp="2m ago" />
    </div>
  ),
  DetailHeader: (
    <div className="w-64">
      <DetailHeader title="Acme Corp" subtitle="Enterprise" status={<StatusBadge status="Active" tone="pos" />} />
    </div>
  ),
  DescriptionList: (
    <div className="w-64">
      <DescriptionList items={[{ label: 'Owner', value: 'Avery' }, { label: 'Plan', value: 'Pro' }]} columns={2} />
    </div>
  ),
  PropertyGrid: (
    <div className="w-64">
      <PropertyGrid items={[{ label: 'Region', value: 'NA' }, { label: 'Seats', value: '48' }]} columns={2} />
    </div>
  ),
  MetadataPanel: (
    <div className="w-56">
      <MetadataPanel title="Metadata" items={[{ label: 'Created', value: 'Jan 2026' }]} />
    </div>
  ),
  Table: (
    <div className="w-64">
      <Table
        caption="Top accounts"
        columns={[{ key: 'name', header: 'Account' }, { key: 'mrr', header: 'MRR', numeric: true }]}
        rows={[{ id: 'a', name: 'Northwind', mrr: '$8.2k' }, { id: 'b', name: 'Globex', mrr: '$6.4k' }]}
        rowKey={(r) => r.id}
      />
    </div>
  ),
  Timeline: (
    <div className="w-64">
      <Timeline items={[{ id: 'e1', title: 'Plan upgraded', timestamp: '2m ago' }, { id: 'e2', title: 'Owner assigned', timestamp: '1h ago' }]} />
    </div>
  ),
  ActivityFeed: (
    <div className="w-64">
      <ActivityFeed title="Activity" items={[{ id: 'e1', title: 'Plan upgraded', actor: 'Avery', timestamp: '2m ago' }]} />
    </div>
  ),
  Toolbar: (
    <div className="w-64">
      <Toolbar leading={<Input placeholder="Search" readOnly />} trailing={<Button size="compact">New</Button>} />
    </div>
  ),
  AppliedFiltersBar: (
    <div className="w-64">
      <AppliedFiltersBar filters={[{ id: 'segment', label: 'Segment', value: 'Enterprise' }]} />
    </div>
  ),
  FacetedFilter: (
    <FacetedFilter
      label="Segment"
      options={[{ value: 'enterprise', label: 'Enterprise', count: 12 }, { value: 'startup', label: 'Startup', count: 31 }]}
      selectedValues={['enterprise']}
      onSelectedValuesChange={noop}
    />
  ),
  AttachmentList: (
    <div className="w-56">
      <AttachmentList attachments={[{ id: 'f1', name: 'report.pdf', size: 12000 }]} />
    </div>
  ),
  NotificationBadge: <NotificationBadge count={12} />,
  KpiCard: (
    <div className="w-48">
      <KpiCard label="Total MRR" value="$78.3k" delta={4.2} spark={[62, 65, 64, 70, 74, 78]} />
    </div>
  ),
  // charts (lightweight only — Recharts charts stay placeholder)
  ChartCard: (
    <div className="w-64">
      <ChartCard title="Line chart example" metric="+18%" description="Sample rows; replace with your data.">
        <div className="h-16 border border-line bg-surface-2" />
      </ChartCard>
    </div>
  ),
  ChartLegend: <ChartLegend items={[{ id: 'new', label: 'New', colorClassName: 'bg-pos' }, { id: 'churn', label: 'Churned', colorClassName: 'bg-neg' }]} />,
  ChartTooltipContent: <ChartTooltipContent label="Jan" rows={[{ label: 'MRR', value: '$78k' }]} />,
  ChartEmptyState: <ChartEmptyState title="No data" description="Adjust filters." />,
}
