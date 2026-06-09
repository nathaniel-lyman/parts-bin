import type { ReactNode } from 'react'
import {
  Accordion, Avatar, Button, Card, Checkbox, EmptyState, Field, IconButton,
  InlineAlert, Input, Kbd, KeyValueList, Metric, Pagination, Progress, RadioGroup,
  SegmentedControl, Select, Skeleton, Slider, Spinner, StatusBadge, Switch, Tabs,
  Tag, Textarea,
} from '../ui'
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
  StatusBadge: <StatusBadge status="Active" />,
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
}
