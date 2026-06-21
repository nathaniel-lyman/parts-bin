import type { ComponentProps, ComponentType } from 'react'

import {
  // primitives
  Button, IconButton, Card, StatusBadge, PageHeader, Tag, Kbd, Link, Separator,
  // form controls
  Input, Textarea, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch,
  SegmentedControl, Slider, Field, DatePicker, DateRangePicker,
  Dropzone, FileUpload, Stepper, WizardLayout,
  // overlays
  Modal, Drawer, Popover, Tooltip, DropdownMenu, ContextMenu, CommandPalette,
  // feedback
  InlineAlert, Banner, Toast, ToastProvider, Spinner, Skeleton, EmptyState, ImportProgress, Progress,
  LoadingBars, LoadingChartDrawIn, LoadingConcentricArcs, LoadingCountingMetric,
  LoadingDonut, LoadingDots, LoadingKpiSkeleton, LoadingProgress, LoadingSparkline,
  // data-display
  Avatar, AvatarGroup, AssigneeChip, ActivityFeed, Timeline, AuditLogItem,
  DetailHeader, KeyValueList, DescriptionList, PropertyGrid, MetadataPanel,
  Tabs, Pagination, Toolbar, AppliedFiltersBar, FacetedFilter, AttachmentList, Metric,
  Table, Accordion,
} from './ui'
import {
  WaterfallChart, SignedMovementChart, ShareDonutChart, LineTrendChart,
  ChartCard, ChartLegend, ChartTooltipContent, ChartEmptyState,
} from './charts'
import { RegionChoropleth, BubbleMap, FlowMap, GeoDrilldown } from './maps'
import { DataGrid } from './DataGrid'
import {
  AppShell, Sidebar, TopNav, Breadcrumbs, FilterBar, SectionHeader, SettingsPanel,
  NotificationBadge,
} from './shell'
import { KpiCard, KpiSummaryRow } from './KpiCard'
import { Sparkline } from './Sparkline'
import { ConfirmDialog } from './ConfirmDialog'
import {
  AssistantPanel, ChatComposer, ChatMarkdown, ChatMessageBubble, ChatMessageList,
  CodeBlock, MessageActions, SuggestedPrompts,
} from './chat'

export const CATEGORIES = [
  'primitive', 'form', 'overlay', 'feedback',
  'data-display', 'chart', 'datagrid', 'map', 'chat', 'shell',
] as const
export type Category = (typeof CATEGORIES)[number]

export interface ComponentEntry {
  /** Display name; matches the barrel export name. */
  name: string
  /** The actual exported component value — enables identity-based coverage. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  /** Subsystem barrel to import from, e.g. './components/ui'. */
  import: string
  category: Category
  /** One line: what it is. */
  purpose: string
  /** When to reach for this component. */
  use_when: string
  /** Disambiguation vs near-twins: twin name (must be cataloged) -> why pick this / the other. */
  prefer_over?: Record<string, string>
  /** Key prop names — compile-time verified to be real props (see factory). */
  props: readonly string[]
  /** Enumerated variant props, e.g. { variant: ['primary','ghost'] }. */
  variants?: Record<string, readonly string[]>
  /** Sibling component names worth knowing about (must be cataloged). */
  related?: readonly string[]
  /** Minimal copy-paste JSX. */
  snippet: string
}

/**
 * Type-safe entry constructor. `props` is constrained to keys of the component's
 * own props type. For well-typed components (all components in this kit), a
 * fictional/misspelled prop name is a compile error (caught by `npm run build`).
 * Props derive from the component value, so components need not export a named
 * props interface.
 */
export function defineComponent<C extends ComponentType<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  component: C,
  entry: Omit<ComponentEntry, 'component' | 'props'> & {
    props: readonly (keyof ComponentProps<C> & string)[]
  },
): ComponentEntry {
  return { ...entry, component, props: [...entry.props] }
}

/**
 * Real components deliberately NOT cataloged: each is composed by a documented
 * parent and should not be reached for directly. The reason strings double as
 * guidance. Reconciled against the runtime barrel enumeration; update when adding
 * or renaming composition sub-fragments.
 */
export const INTERNAL = new Map<string, string>([
  // DataGrid composition pieces — use <DataGrid>, not these directly:
  ['DataGridHeader', 'Composed by DataGrid'],
  ['DataGridBody', 'Composed by DataGrid'],
  ['DataGridRow', 'Composed by DataGrid'],
  ['DataGridCell', 'Composed by DataGrid'],
  ['DataGridToolbar', 'Composed by DataGrid'],
  ['DataGridFooter', 'Composed by DataGrid'],
  ['DataGridColumnDragOverlay', 'Composed by DataGrid'],
  ['DataGridRowCheckbox', 'Composed by DataGrid selection column'],
  ['DataGridSelectAllCheckbox', 'Composed by DataGrid header'],
  // ui sub-fragments — rendered by a documented parent:
  ['PageTitle', 'Rendered by PageHeader'],
  ['PageSubtitle', 'Rendered by PageHeader'],
  ['EventRow', 'Rendered by ActivityFeed / Timeline'],
  ['PresenceBadge', 'Rendered by Avatar (status dot)'],
  ['FilterChip', 'Rendered by AppliedFiltersBar'],
  // shell nav fragments — composed by AppShell / Sidebar:
  ['NavigationItem', 'Composed by Sidebar'],
  ['ActiveNavigationItem', 'NavigationItem with active preset; composed by Sidebar'],
  ['AdminNavigationItem', 'Composed by Sidebar'],
  ['AdminSectionDivider', 'Composed by Sidebar'],
  ['CollapseSidebarControl', 'Composed by Sidebar'],
  ['BrandLockup', 'Composed by Sidebar / TopNav'],
  ['LeftNavigationDrawer', 'Composed by AppShell'],
  // GlobalControls sub-fragments — composed by GlobalControls:
  ['GlobalSearchInput', 'Composed by GlobalControls'],
  ['TimePeriodSelector', 'Composed by GlobalControls'],
  ['NotificationButton', 'Composed by GlobalControls'],
  ['UserAvatarMenu', 'Composed by GlobalControls'],
  ['FilterButton', 'Composed by GlobalControls'],
  ['CalendarIconButton', 'Composed by GlobalControls'],
  // chat composition pieces:
  ['TypingIndicator', 'Rendered by ChatMessageBubble while the assistant is thinking'],
  // chart compatibility names — prefer the neutral aliases in new code:
  ['RevenueMovementChart', 'Compatibility export; use SignedMovementChart for new code'],
  ['MrrShareDonut', 'Compatibility export; use ShareDonutChart for new code'],
  ['MrrTrendChart', 'Compatibility export; use LineTrendChart for new code'],
])

/** Capitalized function exports that are NOT components (currently none). */
export const NON_COMPONENT_OVERRIDES = new Set<string>([])

/** The catalog. One entry per worklisted, reach-for-it-directly component. */
export const CATALOG: ComponentEntry[] = [
  // ── ui primitives ─────────────────────────────────────────────────────────
  defineComponent(Button, {
    name: 'Button', import: './components/ui', category: 'primitive',
    purpose: 'Primary action button with intent variants and a loading state.',
    use_when: 'Any clickable action; pick a variant to signal intent.',
    props: ['variant', 'size', 'loading', 'disabled', 'onClick'],
    variants: { variant: ['primary', 'secondary', 'ghost', 'destructive'], size: ['default', 'compact'] },
    related: ['IconButton'],
    snippet: `<Button variant="primary" onClick={save}>Save</Button>`,
  }),
  defineComponent(IconButton, {
    name: 'IconButton', import: './components/ui', category: 'primitive',
    purpose: 'Square icon-only button; same variants as Button, requires aria-label.',
    use_when: 'A toolbar or compact control where an icon stands in for a text label.',
    props: ['variant', 'size', 'loading', 'aria-label', 'onClick'],
    variants: { variant: ['primary', 'secondary', 'ghost', 'destructive'], size: ['default', 'compact'] },
    related: ['Button', 'Toolbar'],
    snippet: `<IconButton aria-label="Edit" onClick={edit}><EditIcon /></IconButton>`,
  }),
  defineComponent(Card, {
    name: 'Card', import: './components/ui', category: 'primitive',
    purpose: 'Surface container with optional title, description, actions, and footer.',
    use_when: 'Grouping related content into a bordered panel.',
    props: ['title', 'description', 'actions', 'children', 'footer'],
    related: ['SectionHeader', 'ChartCard'],
    snippet: `<Card title="Overview" actions={<Button>Edit</Button>}>{body}</Card>`,
  }),
  defineComponent(StatusBadge, {
    name: 'StatusBadge', import: './components/ui', category: 'primitive',
    purpose: 'Tone-coded label with a status dot; schema-agnostic (any status string + a tone).',
    use_when: 'Showing the lifecycle state of a record. Map your domain status → tone at the call site.',
    prefer_over: { NotificationBadge: 'Use NotificationBadge for an unread/overflow count, not a status tone.' },
    props: ['status', 'tone', 'className'],
    variants: { tone: ['neutral', 'accent', 'pos', 'warn', 'neg'] },
    related: ['NotificationBadge', 'Metric', 'Tag'],
    snippet: `<StatusBadge status="Active" tone="pos" />`,
  }),
  defineComponent(Tag, {
    name: 'Tag', import: './components/ui', category: 'primitive',
    purpose: 'General-purpose label chip with tone variants and optional remove button.',
    use_when: 'Tagging records with categories, topics, or token values.',
    prefer_over: { StatusBadge: 'Use StatusBadge for lifecycle status (Open / Review / Blocked), not free-form labels.' },
    props: ['label', 'tone', 'onRemove', 'className'],
    variants: { tone: ['neutral', 'accent', 'pos', 'warn', 'neg'] },
    related: ['StatusBadge', 'AppliedFiltersBar'],
    snippet: `<Tag tone="accent" label="Beta" onRemove={() => drop('beta')} />`,
  }),
  defineComponent(Kbd, {
    name: 'Kbd', import: './components/ui', category: 'primitive',
    purpose: 'Keyboard-key chip for shortcut hints; renders semantic <kbd> elements.',
    use_when: 'Showing a keyboard shortcut next to a command, menu item, or in help text.',
    props: ['keys', 'children', 'className'],
    related: ['CommandPalette', 'Tooltip'],
    snippet: `<Kbd keys={['Ctrl', 'K']} />`,
  }),
  defineComponent(Link, {
    name: 'Link', import: './components/ui', category: 'primitive',
    purpose: 'Token-styled anchor with accent/muted variants and an external-link preset.',
    use_when: 'Navigation rendered as text — inline references, "view all" links, footer links.',
    prefer_over: { Button: 'Use Button (or variant="ghost") for actions that change state; Link is for navigation.' },
    props: ['href', 'variant', 'external', 'children', 'className'],
    variants: { variant: ['accent', 'muted'] },
    related: ['Button', 'Breadcrumbs'],
    snippet: `<Link href="/docs" variant="muted">Component docs</Link>`,
  }),
  defineComponent(Separator, {
    name: 'Separator', import: './components/ui', category: 'primitive',
    purpose: 'Hairline rule on the line token; horizontal or vertical, decorative by default.',
    use_when: 'Visually dividing groups in toolbars, menus, cards, or stacked sections.',
    props: ['orientation', 'decorative', 'className'],
    variants: { orientation: ['horizontal', 'vertical'] },
    related: ['Toolbar', 'SectionHeader'],
    snippet: `<Separator orientation="vertical" className="mx-2" />`,
  }),
  defineComponent(PageHeader, {
    name: 'PageHeader', import: './components/ui', category: 'primitive',
    purpose: 'Page-level title block with eyebrow, description, and actions slot.',
    use_when: 'Top of a full page or route to establish title and primary actions.',
    props: ['eyebrow', 'title', 'description', 'actions'],
    related: ['SectionHeader', 'DetailHeader'],
    snippet: `<PageHeader title="Projects" description="Track active work" actions={<Button>New</Button>} />`,
  }),

  // ── ui form controls ──────────────────────────────────────────────────────
  defineComponent(Input, {
    name: 'Input', import: './components/ui', category: 'form',
    purpose: 'Themed text input; passes through all native input attributes.',
    use_when: 'Single-line free-text or typed input (text, email, number, …).',
    props: ['value', 'onChange', 'placeholder', 'type', 'disabled'],
    related: ['Textarea', 'Field'],
    snippet: `<Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Name" />`,
  }),
  defineComponent(Textarea, {
    name: 'Textarea', import: './components/ui', category: 'form',
    purpose: 'Themed multi-line text input; passes through native textarea attributes.',
    use_when: 'Free-text that may span multiple lines (notes, descriptions).',
    props: ['value', 'onChange', 'placeholder', 'rows', 'disabled'],
    related: ['Input', 'Field'],
    snippet: `<Textarea value={v} onChange={(e) => setV(e.target.value)} rows={4} />`,
  }),
  defineComponent(Select, {
    name: 'Select', import: './components/ui', category: 'form',
    purpose: 'Native single-select dropdown styled to the theme.',
    use_when: 'Short, fixed list of options where type-ahead adds no value.',
    prefer_over: {
      Combobox: 'Use Combobox when options exceed ~7 or filtering helps.',
      DropdownMenu: 'Use DropdownMenu for actions, not value selection.',
    },
    props: ['value', 'onChange', 'children', 'disabled'],
    related: ['Combobox', 'DropdownMenu', 'Field'],
    snippet: `<Select value={v} onChange={(e) => setV(e.target.value)}><option>SMB</option></Select>`,
  }),
  defineComponent(Combobox, {
    name: 'Combobox', import: './components/ui', category: 'form',
    purpose: 'Single-select input with type-ahead filtering over an options list.',
    use_when: 'Options exceed ~7, or filtering helps the user find a value.',
    prefer_over: {
      Select: 'Use Select for short, fixed option lists.',
      DropdownMenu: 'Use DropdownMenu for actions, not value selection.',
    },
    props: ['options', 'value', 'onValueChange', 'placeholder', 'disabled'],
    related: ['Select', 'DropdownMenu', 'Field'],
    snippet: `<Combobox options={opts} value={v} onValueChange={setV} placeholder="Owner" />`,
  }),
  defineComponent(MultiSelect, {
    name: 'MultiSelect', import: './components/ui', category: 'form',
    purpose: 'Multi-value combobox with token chips, type-to-filter, and toggle-to-deselect.',
    use_when: 'Picking several values from a list (tags, owners, segments) in a form.',
    prefer_over: {
      Combobox: 'Use Combobox when exactly one value can be selected.',
      FacetedFilter: 'Use FacetedFilter for filtering a dataset, not capturing a form value.',
    },
    props: ['options', 'values', 'defaultValues', 'onValuesChange', 'placeholder', 'disabled'],
    related: ['Combobox', 'FacetedFilter', 'Tag', 'Field'],
    snippet: `<MultiSelect options={opts} values={vals} onValuesChange={setVals} placeholder="Segments" />`,
  }),
  defineComponent(Checkbox, {
    name: 'Checkbox', import: './components/ui', category: 'form',
    purpose: 'Single boolean checkbox with optional label and hint.',
    use_when: 'Toggling a single on/off choice, or one item in a multi-select set.',
    props: ['label', 'hint', 'checked', 'onChange', 'disabled'],
    related: ['Switch', 'RadioGroup'],
    snippet: `<Checkbox label="Email me" checked={on} onChange={(e) => setOn(e.target.checked)} />`,
  }),
  defineComponent(RadioGroup, {
    name: 'RadioGroup', import: './components/ui', category: 'form',
    purpose: 'Single-choice group of radio options with label and orientation.',
    use_when: 'Picking exactly one from a small, visible set of mutually exclusive options.',
    props: ['options', 'value', 'onValueChange', 'label', 'orientation'],
    variants: { orientation: ['vertical', 'horizontal'] },
    related: ['Checkbox', 'SegmentedControl', 'Select'],
    snippet: `<RadioGroup label="Plan" options={opts} value={v} onValueChange={setV} />`,
  }),
  defineComponent(Switch, {
    name: 'Switch', import: './components/ui', category: 'form',
    purpose: 'Toggle switch for a single boolean setting, with label and hint.',
    use_when: 'An immediately-applied on/off setting (vs. a form checkbox).',
    props: ['label', 'hint', 'checked', 'onChange', 'disabled'],
    related: ['Checkbox'],
    snippet: `<Switch label="Dark mode" checked={dark} onChange={(e) => setDark(e.target.checked)} />`,
  }),
  defineComponent(SegmentedControl, {
    name: 'SegmentedControl', import: './components/ui', category: 'form',
    purpose: 'Inline single-choice control rendering options as joined segments.',
    use_when: 'A small set of mutually exclusive view/filter options shown inline.',
    props: ['options', 'value', 'onValueChange', 'size', 'label'],
    variants: { size: ['default', 'compact'] },
    related: ['RadioGroup', 'Tabs'],
    snippet: `<SegmentedControl options={opts} value={v} onValueChange={setV} />`,
  }),
  defineComponent(Slider, {
    name: 'Slider', import: './components/ui', category: 'form',
    purpose: 'Accent-themed range input with optional label and live value readout.',
    use_when: 'Picking an approximate numeric value where the gesture matters more than precision (thresholds, weights, percentages).',
    prefer_over: { Input: 'Use Input type="number" when the exact value matters and must be typed.' },
    props: ['value', 'defaultValue', 'onValueChange', 'min', 'max', 'step', 'label', 'showValue', 'formatValue', 'disabled'],
    related: ['Input', 'Field'],
    snippet: `<Slider label="Review threshold" min={0} max={100} defaultValue={60} showValue formatValue={(v) => v + '%'} onValueChange={setThreshold} />`,
  }),
  defineComponent(Field, {
    name: 'Field', import: './components/ui', category: 'form',
    purpose: 'Label + hint + error wrapper that wires accessibility to its child control.',
    use_when: 'Giving any single control a label, help text, and validation message.',
    props: ['label', 'children', 'hint', 'error', 'required'],
    variants: { layout: ['vertical', 'horizontal'] },
    related: ['Input', 'Select', 'Combobox'],
    snippet: `<Field label="Name" required error={err}><Input value={v} onChange={onChange} /></Field>`,
  }),
  defineComponent(DatePicker, {
    name: 'DatePicker', import: './components/ui', category: 'form',
    purpose: 'Single-date input with a labelled native date control.',
    use_when: 'Capturing one date value.',
    prefer_over: { DateRangePicker: 'Use DateRangePicker when the user needs a start/end span.' },
    props: ['label', 'value', 'onValueChange', 'id', 'disabled'],
    related: ['DateRangePicker', 'Field'],
    snippet: `<DatePicker label="Renews" value={d} onValueChange={setD} />`,
  }),
  defineComponent(DateRangePicker, {
    name: 'DateRangePicker', import: './components/ui', category: 'form',
    purpose: 'Start/end date range input with optional quick presets.',
    use_when: 'Selecting a date span, e.g. a reporting window.',
    prefer_over: { DatePicker: 'Use DatePicker when only a single date is needed.' },
    props: ['label', 'value', 'onValueChange', 'presets', 'emptyLabel'],
    related: ['DatePicker', 'Field'],
    snippet: `<DateRangePicker label="Period" value={range} onValueChange={setRange} presets={presets} />`,
  }),
  defineComponent(Dropzone, {
    name: 'Dropzone', import: './components/ui', category: 'form',
    purpose: 'Drag-and-drop / click file selection target firing onFilesSelected.',
    use_when: 'Accepting file uploads without needing to render the picked files.',
    prefer_over: { FileUpload: 'Use FileUpload to also show the selected files list.' },
    props: ['onFilesSelected', 'accept', 'multiple', 'label', 'description'],
    related: ['FileUpload', 'AttachmentList', 'ImportProgress'],
    snippet: `<Dropzone multiple onFilesSelected={(files) => add(files)} />`,
  }),
  defineComponent(FileUpload, {
    name: 'FileUpload', import: './components/ui', category: 'form',
    purpose: 'Dropzone plus a rendered list of the currently selected files.',
    use_when: 'Uploading files and showing what has been picked so far.',
    prefer_over: { Dropzone: 'Use Dropzone alone when you render the file list yourself.' },
    props: ['files', 'onFilesSelected', 'accept', 'multiple', 'label'],
    related: ['Dropzone', 'AttachmentList', 'ImportProgress'],
    snippet: `<FileUpload files={files} onFilesSelected={setFiles} multiple />`,
  }),
  defineComponent(Stepper, {
    name: 'Stepper', import: './components/ui', category: 'form',
    purpose: 'Progress indicator showing ordered steps and their states.',
    use_when: 'Visualizing where the user is in a multi-step flow.',
    prefer_over: { WizardLayout: 'Use WizardLayout for the full wizard scaffold (header, body, nav buttons).' },
    props: ['steps', 'currentStepId', 'onStepSelect', 'orientation'],
    variants: { orientation: ['horizontal', 'vertical'] },
    related: ['WizardLayout'],
    snippet: `<Stepper steps={steps} currentStepId="details" onStepSelect={goTo} />`,
  }),
  defineComponent(WizardLayout, {
    name: 'WizardLayout', import: './components/ui', category: 'form',
    purpose: 'Full multi-step wizard scaffold: embedded Stepper, title, body, back/next nav.',
    use_when: 'Building a guided multi-step task end to end.',
    prefer_over: { Stepper: 'Use Stepper alone when you only need the progress indicator.' },
    props: ['steps', 'currentStepId', 'title', 'children', 'onNext', 'onBack'],
    related: ['Stepper'],
    snippet: `<WizardLayout steps={steps} currentStepId="info" title="Setup" onNext={next} onBack={back}>{body}</WizardLayout>`,
  }),

  // ── ui overlays ───────────────────────────────────────────────────────────
  defineComponent(Modal, {
    name: 'Modal', import: './components/ui', category: 'overlay',
    purpose: 'Centered blocking dialog with title, body, and footer; scrim closes it.',
    use_when: 'A focused, blocking task or confirmation that interrupts the flow.',
    prefer_over: { Drawer: 'Use Drawer for a side panel that keeps page context visible.' },
    props: ['title', 'onClose', 'children', 'footer'],
    related: ['Drawer', 'ConfirmDialog'],
    snippet: `<Modal title="Edit" onClose={close} footer={<Button onClick={save}>Save</Button>}>{body}</Modal>`,
  }),
  defineComponent(Drawer, {
    name: 'Drawer', import: './components/ui', category: 'overlay',
    purpose: 'Edge-anchored sliding panel with title, body, and footer.',
    use_when: 'A contextual task or detail view that should keep the page in sight. bodyClassName REPLACES (not merges with) the default body padding/scroll classes — for full-bleed layouts like AssistantPanel.',
    prefer_over: { Modal: 'Use Modal for a centered, fully blocking confirm/decision.' },
    props: ['title', 'onClose', 'children', 'footer', 'side', 'bodyClassName'],
    variants: { side: ['right', 'left'] },
    related: ['Modal'],
    snippet: `<Drawer title="Filters" side="right" onClose={close}>{body}</Drawer>`,
  }),
  defineComponent(Popover, {
    name: 'Popover', import: './components/ui', category: 'overlay',
    purpose: 'Click-triggered floating panel anchored to its trigger element.',
    use_when: 'Lightweight transient content (a form, picker, or info) tied to a control.',
    props: ['trigger', 'children', 'align', 'className'],
    variants: { align: ['start', 'end'] },
    related: ['Tooltip', 'DropdownMenu'],
    snippet: `<Popover trigger={<Button>Options</Button>}>{panel}</Popover>`,
  }),
  defineComponent(Tooltip, {
    name: 'Tooltip', import: './components/ui', category: 'overlay',
    purpose: 'Hover/focus label that floats next to its child element.',
    use_when: 'Brief, non-interactive helper text for a control or icon.',
    props: ['children', 'content', 'side'],
    variants: { side: ['top', 'bottom'] },
    related: ['Popover'],
    snippet: `<Tooltip content="Refresh"><IconButton aria-label="Refresh"><Icon /></IconButton></Tooltip>`,
  }),
  defineComponent(DropdownMenu, {
    name: 'DropdownMenu', import: './components/ui', category: 'overlay',
    purpose: 'Button-triggered menu of actions, with destructive and disabled items.',
    use_when: 'Offering a list of actions (not selecting a value).',
    prefer_over: {
      Select: 'Use Select to choose a form value, not to run actions.',
      Combobox: 'Use Combobox to pick a value with type-ahead, not to run actions.',
    },
    props: ['label', 'items', 'align'],
    variants: { align: ['start', 'end'] },
    related: ['Select', 'Combobox', 'CommandPalette'],
    snippet: `<DropdownMenu label="Actions" items={[{ id: 'del', label: 'Delete', destructive: true, onSelect: del }]} />`,
  }),
  defineComponent(ContextMenu, {
    name: 'ContextMenu', import: './components/ui', category: 'overlay',
    purpose: 'Right-click menu that opens at the pointer over a wrapped target.',
    use_when: 'Contextual actions on rows, cards, or canvas regions via right-click.',
    prefer_over: { DropdownMenu: 'Use DropdownMenu when actions hang off a visible trigger button.' },
    props: ['items', 'children', 'className'],
    related: ['DropdownMenu'],
    snippet: `<ContextMenu items={[{ id: 'del', label: 'Delete', destructive: true, onSelect: del }]}><RecordRow /></ContextMenu>`,
  }),
  defineComponent(CommandPalette, {
    name: 'CommandPalette', import: './components/ui', category: 'overlay',
    purpose: 'Searchable, grouped command launcher with keyboard shortcut.',
    use_when: 'A global, type-to-find action launcher across the app.',
    props: ['groups', 'open', 'onOpenChange', 'enableGlobalShortcuts', 'placeholder', 'trigger'],
    related: ['DropdownMenu'],
    snippet: `<CommandPalette groups={groups} open={open} onOpenChange={setOpen} />`,
  }),

  // ── ui feedback ───────────────────────────────────────────────────────────
  defineComponent(InlineAlert, {
    name: 'InlineAlert', import: './components/ui', category: 'feedback',
    purpose: 'Persistent in-context alert banner with tone, title, and optional dismiss.',
    use_when: 'Surfacing a message that must stay visible in place until resolved.',
    prefer_over: { Toast: 'Use Toast for a transient, auto-dismissing notification.' },
    props: ['tone', 'title', 'children', 'action', 'onDismiss'],
    variants: { tone: ['accent', 'pos', 'neg', 'warn'] },
    related: ['Toast', 'EmptyState'],
    snippet: `<InlineAlert tone="warn" title="Heads up">Renewal is overdue.</InlineAlert>`,
  }),
  defineComponent(Banner, {
    name: 'Banner', import: './components/ui', category: 'feedback',
    purpose: 'Full-width app/page-level announcement bar with tone, action slot, and dismiss.',
    use_when: 'Maintenance windows, trial expiry, or environment notices spanning the page top.',
    prefer_over: {
      InlineAlert: 'Use InlineAlert for a message scoped to a section or form.',
      Toast: 'Use Toast for transient feedback that should auto-dismiss.',
    },
    props: ['tone', 'children', 'action', 'onDismiss', 'className'],
    variants: { tone: ['accent', 'pos', 'warn', 'neg'] },
    related: ['InlineAlert', 'Toast'],
    snippet: `<Banner tone="warn" action={<Button size="compact">Upgrade</Button>} onDismiss={hide}>Trial ends in 3 days.</Banner>`,
  }),
  defineComponent(Toast, {
    name: 'Toast', import: './components/ui', category: 'feedback',
    purpose: 'Single transient notification with optional title, action button, and dismiss.',
    use_when: 'Rarely directly — prefer the useToast hook via ToastProvider: push(text, { tone, title, action, duration }).',
    prefer_over: { InlineAlert: 'Use InlineAlert for a persistent in-context message.' },
    props: ['tone', 'title', 'action', 'onDismiss', 'children'],
    variants: { tone: ['accent', 'pos', 'neg', 'warn'] },
    related: ['ToastProvider', 'InlineAlert'],
    snippet: `toast('Record deleted', { tone: 'neg', title: 'Deleted', action: { label: 'Undo', onClick: undo } })`,
  }),
  defineComponent(ToastProvider, {
    name: 'ToastProvider', import: './components/ui', category: 'feedback',
    purpose: 'Context provider that renders queued toasts; exposes push via useToast.',
    use_when: 'Wrap the app once so any component can fire toasts through useToast.',
    props: ['children'],
    related: ['Toast'],
    snippet: `<ToastProvider><App /></ToastProvider>`,
  }),
  defineComponent(Spinner, {
    name: 'Spinner', import: './components/ui', category: 'feedback',
    purpose: 'Small accessible loading spinner with size and label.',
    use_when: 'Inline indeterminate loading inside buttons or compact regions.',
    props: ['size', 'label', 'className'],
    variants: { size: ['sm', 'default', 'lg'] },
    related: ['Skeleton', 'LoadingDots'],
    snippet: `<Spinner size="sm" label="Loading" />`,
  }),
  defineComponent(Skeleton, {
    name: 'Skeleton', import: './components/ui', category: 'feedback',
    purpose: 'Shimmer placeholder block; size it with className.',
    use_when: 'Reserving layout while content loads.',
    props: ['className'],
    related: ['LoadingKpiSkeleton', 'Spinner'],
    snippet: `<Skeleton className="h-4 w-32" />`,
  }),
  defineComponent(EmptyState, {
    name: 'EmptyState', import: './components/ui', category: 'feedback',
    purpose: 'Centered empty/zero-data message with glyph, title, and optional action.',
    use_when: 'A list, table, or panel has no data to show.',
    props: ['title', 'description', 'action', 'glyph'],
    related: ['ChartEmptyState', 'InlineAlert'],
    snippet: `<EmptyState title="No projects" description="Create your first project." action={<Button>New</Button>} />`,
  }),
  defineComponent(Progress, {
    name: 'Progress', import: './components/ui', category: 'feedback',
    purpose: 'Determinate progress bar with tone variants, label, and value readout.',
    use_when: 'Quotas, capacity meters, and completion percentages.',
    prefer_over: {
      ImportProgress: 'Use ImportProgress for a running import/upload with a detail line.',
      Spinner: 'Use Spinner when progress is indeterminate.',
    },
    props: ['value', 'max', 'tone', 'label', 'showValue', 'className'],
    variants: { tone: ['accent', 'pos', 'warn', 'neg'] },
    related: ['ImportProgress', 'Spinner', 'Metric'],
    snippet: `<Progress value={62} label="Storage" showValue tone="warn" />`,
  }),
  defineComponent(ImportProgress, {
    name: 'ImportProgress', import: './components/ui', category: 'feedback',
    purpose: 'Determinate progress bar for an import/upload with label and detail.',
    use_when: 'Showing measurable progress of a running import or upload.',
    props: ['value', 'label', 'detail', 'className'],
    related: ['LoadingProgress', 'FileUpload'],
    snippet: `<ImportProgress value={62} label="Importing" detail="124 of 200 rows" />`,
  }),
  defineComponent(LoadingBars, {
    name: 'LoadingBars', import: './components/ui', category: 'feedback',
    purpose: 'Animated equalizer bars loading indicator.',
    use_when: 'Placeholder for an activity feed or list-style region.',
    props: ['label', 'className'],
    related: ['LoadingDots', 'LoadingSparkline'],
    snippet: `<LoadingBars label="Loading activity" />`,
  }),
  defineComponent(LoadingChartDrawIn, {
    name: 'LoadingChartDrawIn', import: './components/ui', category: 'feedback',
    purpose: 'Line-chart draw-in animation used as a chart loading state.',
    use_when: 'Placeholder while a line/area chart loads.',
    props: ['label', 'className'],
    related: ['LoadingDonut', 'LoadingSparkline'],
    snippet: `<LoadingChartDrawIn label="Loading chart" />`,
  }),
  defineComponent(LoadingConcentricArcs, {
    name: 'LoadingConcentricArcs', import: './components/ui', category: 'feedback',
    purpose: 'Concentric rotating arcs loading indicator.',
    use_when: 'A distinctive centered loader for a larger empty region.',
    props: ['label', 'className'],
    related: ['LoadingDonut', 'LoadingDots'],
    snippet: `<LoadingConcentricArcs label="Loading" />`,
  }),
  defineComponent(LoadingCountingMetric, {
    name: 'LoadingCountingMetric', import: './components/ui', category: 'feedback',
    purpose: 'Animated count-up to a target metric value while loading.',
    use_when: 'Placeholder for a single KPI/metric that animates toward its value.',
    props: ['target', 'metricLabel', 'formatValue', 'label', 'className'],
    related: ['LoadingKpiSkeleton', 'LoadingProgress'],
    snippet: `<LoadingCountingMetric metricLabel="Total value" target={78300} />`,
  }),
  defineComponent(LoadingDonut, {
    name: 'LoadingDonut', import: './components/ui', category: 'feedback',
    purpose: 'Animated donut-fill loading indicator with tone.',
    use_when: 'Placeholder while a donut/share chart loads.',
    props: ['label', 'tone', 'className'],
    variants: { tone: ['accent', 'pos', 'intel', 'warn', 'neg', 'muted'] },
    related: ['LoadingChartDrawIn', 'LoadingConcentricArcs'],
    snippet: `<LoadingDonut label="Loading donut chart" tone="accent" />`,
  }),
  defineComponent(LoadingDots, {
    name: 'LoadingDots', import: './components/ui', category: 'feedback',
    purpose: 'Three bouncing dots loading indicator.',
    use_when: 'Minimal inline loading hint (e.g. pending text).',
    props: ['label', 'className'],
    related: ['Spinner', 'LoadingBars'],
    snippet: `<LoadingDots label="Loading" />`,
  }),
  defineComponent(LoadingKpiSkeleton, {
    name: 'LoadingKpiSkeleton', import: './components/ui', category: 'feedback',
    purpose: 'Skeleton shaped like a KPI card while metrics load.',
    use_when: 'Reserving layout for a KpiCard before its data arrives.',
    props: ['label', 'className'],
    related: ['Skeleton', 'LoadingCountingMetric'],
    snippet: `<LoadingKpiSkeleton label="Loading KPI" />`,
  }),
  defineComponent(LoadingProgress, {
    name: 'LoadingProgress', import: './components/ui', category: 'feedback',
    purpose: 'Indeterminate progress bar with a label and detail line.',
    use_when: 'Background work whose exact percentage is unknown.',
    prefer_over: { ImportProgress: 'Use ImportProgress when you have a measurable percentage.' },
    props: ['label', 'detail', 'className'],
    related: ['ImportProgress', 'LoadingCountingMetric'],
    snippet: `<LoadingProgress label="Syncing" detail="Syncing records" />`,
  }),
  defineComponent(LoadingSparkline, {
    name: 'LoadingSparkline', import: './components/ui', category: 'feedback',
    purpose: 'Animated sparkline draw-in loading indicator.',
    use_when: 'Placeholder where a small inline Sparkline will render.',
    props: ['label', 'className'],
    related: ['Sparkline', 'LoadingChartDrawIn'],
    snippet: `<LoadingSparkline label="Loading sparkline" />`,
  }),

  // ── ui data-display ───────────────────────────────────────────────────────
  defineComponent(Avatar, {
    name: 'Avatar', import: './components/ui', category: 'data-display',
    purpose: 'User avatar from image or initials, with optional presence dot.',
    use_when: 'Representing a single person or owner.',
    props: ['name', 'src', 'initials', 'size', 'status'],
    variants: { size: ['sm', 'md', 'lg'], status: ['online', 'away', 'busy', 'offline'] },
    related: ['AvatarGroup', 'AssigneeChip'],
    snippet: `<Avatar name="Avery Cohen" status="online" />`,
  }),
  defineComponent(AvatarGroup, {
    name: 'AvatarGroup', import: './components/ui', category: 'data-display',
    purpose: 'Overlapping stack of avatars with a +N overflow chip.',
    use_when: 'Showing several people compactly (e.g. assignees on a row).',
    props: ['users', 'max', 'size', 'className'],
    variants: { size: ['sm', 'md', 'lg'] },
    related: ['Avatar', 'AssigneeChip'],
    snippet: `<AvatarGroup users={people} max={4} />`,
  }),
  defineComponent(AssigneeChip, {
    name: 'AssigneeChip', import: './components/ui', category: 'data-display',
    purpose: 'Avatar + name chip for an assigned person, optionally removable.',
    use_when: 'Showing (and optionally clearing) the person assigned to something.',
    props: ['name', 'src', 'status', 'meta', 'onRemove'],
    related: ['Avatar', 'AvatarGroup'],
    snippet: `<AssigneeChip name="Avery Cohen" onRemove={unassign} />`,
  }),
  defineComponent(ActivityFeed, {
    name: 'ActivityFeed', import: './components/ui', category: 'data-display',
    purpose: 'Chronological list of activity events with tone, actor, and timestamp.',
    use_when: 'A stream of recent events or actions on a record.',
    prefer_over: { Timeline: 'Use Timeline for a connected, milestone-style vertical history.' },
    props: ['items', 'title', 'emptyState', 'className'],
    related: ['Timeline', 'AuditLogItem'],
    snippet: `<ActivityFeed title="Activity" items={events} />`,
  }),
  defineComponent(Timeline, {
    name: 'Timeline', import: './components/ui', category: 'data-display',
    purpose: 'Vertical connected timeline of events.',
    use_when: 'A milestone-style history where ordering and connection matter.',
    prefer_over: { ActivityFeed: 'Use ActivityFeed for a flat recent-events stream with a title/empty state.' },
    props: ['items', 'className'],
    related: ['ActivityFeed', 'AuditLogItem'],
    snippet: `<Timeline items={events} />`,
  }),
  defineComponent(AuditLogItem, {
    name: 'AuditLogItem', import: './components/ui', category: 'data-display',
    purpose: 'Single audit-log row: an activity event annotated with a resource.',
    use_when: 'Rendering one entry of an audit/change log.',
    props: ['resource', 'meta', 'title', 'timestamp', 'actor'],
    related: ['ActivityFeed', 'Timeline'],
    snippet: `<AuditLogItem id="e1" title="Updated priority" resource="Project Alpha" actor="Avery" timestamp="2m ago" />`,
  }),
  defineComponent(DetailHeader, {
    name: 'DetailHeader', import: './components/ui', category: 'data-display',
    purpose: 'Header for a detail/record view: title, subtitle, status, meta, actions.',
    use_when: 'Top of a single-record detail page or drawer.',
    props: ['title', 'subtitle', 'meta', 'status', 'actions'],
    related: ['PageHeader', 'KeyValueList'],
    snippet: `<DetailHeader title="Acme Corp" subtitle="Enterprise" status={<StatusBadge status="Active" tone="pos" />} />`,
  }),
  defineComponent(KeyValueList, {
    name: 'KeyValueList', import: './components/ui', category: 'data-display',
    purpose: 'Single-column label/value list for record fields.',
    use_when: 'A short vertical list of label/value pairs.',
    prefer_over: {
      DescriptionList: 'Use DescriptionList for a multi-column (1–3) grid layout.',
      PropertyGrid: 'Use PropertyGrid for a denser 3-column property grid.',
      MetadataPanel: 'Use MetadataPanel when the pairs belong in a titled card with a footer.',
    },
    props: ['items', 'className'],
    related: ['DescriptionList', 'PropertyGrid', 'MetadataPanel'],
    snippet: `<KeyValueList items={[{ label: 'Owner', value: 'Avery' }]} />`,
  }),
  defineComponent(DescriptionList, {
    name: 'DescriptionList', import: './components/ui', category: 'data-display',
    purpose: 'Multi-column (1–3) grid of label/value pairs.',
    use_when: 'Several fields you want laid out in columns rather than a single column.',
    prefer_over: {
      KeyValueList: 'Use KeyValueList for a simple single-column list.',
      PropertyGrid: 'PropertyGrid is this list preset to a denser 3-column default.',
      MetadataPanel: 'Use MetadataPanel when the pairs belong in a titled card with a footer.',
    },
    props: ['items', 'columns', 'className'],
    related: ['KeyValueList', 'PropertyGrid', 'MetadataPanel'],
    snippet: `<DescriptionList items={fields} columns={2} />`,
  }),
  defineComponent(PropertyGrid, {
    name: 'PropertyGrid', import: './components/ui', category: 'data-display',
    purpose: 'Description list preset to a dense 3-column property grid.',
    use_when: 'Many compact properties that read best in a wide 3-column grid.',
    prefer_over: {
      KeyValueList: 'Use KeyValueList for a simple single-column list.',
      DescriptionList: 'Use DescriptionList to choose 1–2 columns explicitly.',
      MetadataPanel: 'Use MetadataPanel when the pairs belong in a titled card with a footer.',
    },
    props: ['items', 'columns', 'className'],
    related: ['KeyValueList', 'DescriptionList', 'MetadataPanel'],
    snippet: `<PropertyGrid items={props} />`,
  }),
  defineComponent(MetadataPanel, {
    name: 'MetadataPanel', import: './components/ui', category: 'data-display',
    purpose: 'Titled card wrapping a label/value list with an optional footer.',
    use_when: 'Presenting record metadata as a self-contained titled panel.',
    prefer_over: {
      KeyValueList: 'Use KeyValueList for a bare single-column list without a card.',
      DescriptionList: 'Use DescriptionList for a bare multi-column grid without a card.',
      PropertyGrid: 'Use PropertyGrid for a bare dense 3-column grid without a card.',
    },
    props: ['title', 'items', 'footer', 'className'],
    related: ['KeyValueList', 'DescriptionList', 'PropertyGrid'],
    snippet: `<MetadataPanel title="Metadata" items={fields} />`,
  }),
  defineComponent(Table, {
    name: 'Table', import: './components/ui', category: 'data-display',
    purpose: 'Lightweight static table (columns + rows) for small read-only datasets.',
    use_when: 'A detail panel or card needs a handful of rows with no interaction.',
    prefer_over: { DataGrid: 'Use DataGrid when the data needs sorting, filtering, selection, or column management.' },
    props: ['columns', 'rows', 'rowKey', 'caption', 'emptyMessage', 'className'],
    related: ['DataGrid', 'KeyValueList', 'DescriptionList'],
    snippet: `<Table caption="Open projects" columns={[{ key: 'name', header: 'Project' }, { key: 'score', header: 'Score', numeric: true }]} rows={rows} rowKey={(r) => r.id} />`,
  }),
  defineComponent(Accordion, {
    name: 'Accordion', import: './components/ui', category: 'data-display',
    purpose: 'Disclosure list of collapsible sections; single-open by default.',
    use_when: 'Stacked sections the user expands one at a time (settings groups, FAQs).',
    prefer_over: { Tabs: 'Use Tabs for equally-ranked views the user switches between, not progressive disclosure.' },
    props: ['items', 'multiple', 'defaultOpenIds', 'className'],
    related: ['Tabs', 'Card'],
    snippet: `<Accordion items={[{ id: 'general', title: 'General', content: body }]} defaultOpenIds={['general']} />`,
  }),
  defineComponent(Tabs, {
    name: 'Tabs', import: './components/ui', category: 'data-display',
    purpose: 'Tabbed panels switching between content sections.',
    use_when: 'Splitting content into selectable, equally-ranked views.',
    props: ['items', 'value', 'defaultValue', 'onValueChange', 'label'],
    related: ['SegmentedControl'],
    snippet: `<Tabs items={[{ id: 'a', label: 'Overview', content: body }]} defaultValue="a" />`,
  }),
  defineComponent(Pagination, {
    name: 'Pagination', import: './components/ui', category: 'data-display',
    purpose: 'Page navigation control derived from page/pageSize/total.',
    use_when: 'Paging through a list or table not handled by DataGrid itself.',
    props: ['page', 'pageSize', 'total', 'onPageChange'],
    related: ['DataGrid', 'Toolbar'],
    snippet: `<Pagination page={p} pageSize={25} total={240} onPageChange={setP} />`,
  }),
  defineComponent(Toolbar, {
    name: 'Toolbar', import: './components/ui', category: 'data-display',
    purpose: 'Horizontal bar with leading/trailing slots for controls.',
    use_when: 'Grouping actions, filters, or search above content.',
    props: ['children', 'leading', 'trailing'],
    related: ['FilterBar', 'AppliedFiltersBar', 'IconButton'],
    snippet: `<Toolbar leading={<Input placeholder="Search" />} trailing={<Button>New</Button>} />`,
  }),
  defineComponent(AppliedFiltersBar, {
    name: 'AppliedFiltersBar', import: './components/ui', category: 'data-display',
    purpose: 'Row of removable filter chips plus a clear-all control.',
    use_when: 'Showing the currently active filters so the user can drop them.',
    props: ['filters', 'onClearAll', 'emptyLabel', 'className'],
    related: ['FacetedFilter', 'FilterBar', 'Toolbar'],
    snippet: `<AppliedFiltersBar filters={chips} onClearAll={clearAll} />`,
  }),
  defineComponent(FacetedFilter, {
    name: 'FacetedFilter', import: './components/ui', category: 'data-display',
    purpose: 'Searchable multi-select facet with option counts.',
    use_when: 'Filtering a dataset by one faceted dimension with many options.',
    props: ['label', 'options', 'selectedValues', 'onSelectedValuesChange', 'searchPlaceholder'],
    related: ['AppliedFiltersBar', 'Combobox'],
    snippet: `<FacetedFilter label="Segment" options={opts} selectedValues={sel} onSelectedValuesChange={setSel} />`,
  }),
  defineComponent(AttachmentList, {
    name: 'AttachmentList', import: './components/ui', category: 'data-display',
    purpose: 'List of attachments with name, size, status, and remove action.',
    use_when: 'Displaying files attached to a record.',
    props: ['attachments', 'emptyLabel', 'className'],
    related: ['FileUpload', 'Dropzone'],
    snippet: `<AttachmentList attachments={[{ id: 'f1', name: 'report.pdf', size: 12000 }]} />`,
  }),
  defineComponent(Metric, {
    name: 'Metric', import: './components/ui', category: 'data-display',
    purpose: 'Compact label/value/delta stat with status-toned coloring.',
    use_when: 'A small inline stat where a full KpiCard would be too heavy.',
    prefer_over: { KpiCard: 'Use KpiCard for a top-level KPI tile with a sparkline.' },
    props: ['label', 'value', 'delta', 'status'],
    variants: { status: ['positive', 'negative', 'warning', 'neutral', 'intelligence', 'review', 'reject'] },
    related: ['KpiCard', 'StatusBadge'],
    snippet: `<Metric label="Error rate" value="2.1%" delta="-0.3" status="positive" />`,
  }),

  // ── charts ────────────────────────────────────────────────────────────────
  defineComponent(WaterfallChart, {
    name: 'WaterfallChart', import: './components/charts', category: 'chart',
    purpose: 'Waterfall chart of cumulative start → increases/decreases → total.',
    use_when: 'Explaining how any total is built up from sequential deltas; pass sample or real step data.',
    props: ['data', 'showLabels', 'height', 'barWidth', 'valueFormatter'],
    related: ['SignedMovementChart', 'ChartCard'],
    snippet: `<WaterfallChart data={bridgeSteps} showLabels valueFormatter={formatValue} />`,
  }),
  defineComponent(SignedMovementChart, {
    name: 'SignedMovementChart', import: './components/charts', category: 'chart',
    purpose: 'Stacked movement bars for positive and negative contribution categories.',
    use_when: 'Any signed movement breakdown that fits the { month, New, Expansion, Churn } compatibility row shape; pass `data` for your own rows. Use the Churn key as the negative bucket label required by the compatibility wrapper.',
    props: ['data', 'barWidth', 'showLabels'],
    related: ['WaterfallChart', 'LineTrendChart'],
    snippet: `<SignedMovementChart data={movementRows} barWidth={28} showLabels />`,
  }),
  defineComponent(ShareDonutChart, {
    name: 'ShareDonutChart', import: './components/charts', category: 'chart',
    purpose: 'Donut chart for generic share-of-total rows with the shared chart legend.',
    use_when: 'Showing how any total splits across categories; pass rows shaped as { id, label, value }.',
    props: ['data', 'totalLabel', 'valueFormatter'],
    related: ['LineTrendChart', 'ChartLegend'],
    snippet: `<ShareDonutChart data={shareRows} totalLabel="Total" valueFormatter={formatValue} />`,
  }),
  defineComponent(LineTrendChart, {
    name: 'LineTrendChart', import: './components/charts', category: 'chart',
    purpose: 'Multi-series line chart themed from the SERIES palette; sample trend data by default.',
    use_when: 'Any value-over-time lines — pass `data` rows and the `series` keys to plot.',
    props: ['data', 'series', 'xKey', 'showEndLabels'],
    related: ['ShareDonutChart', 'SignedMovementChart'],
    snippet: `<LineTrendChart data={rows} series={['Plan A', 'Plan B']} xKey="period" showEndLabels />`,
  }),
  defineComponent(ChartCard, {
    name: 'ChartCard', import: './components/charts', category: 'chart',
    purpose: 'Reusable chart frame: title, caveat/description, headline metric, actions, and chart body.',
    use_when: 'Wrapping any chart in the standard chart panel; use either an example label in demos or an insight claim in product dashboards.',
    props: ['title', 'description', 'metric', 'actions', 'children'],
    related: ['Card', 'ChartLegend', 'ChartEmptyState'],
    snippet: `<ChartCard title="Line chart example" metric="+18%" description="Sample rows; replace with your data."><LineTrendChart showEndLabels /></ChartCard>`,
  }),
  defineComponent(ChartLegend, {
    name: 'ChartLegend', import: './components/charts', category: 'chart',
    purpose: 'Themed legend row of color-keyed series labels with optional values.',
    use_when: 'Labeling chart series outside the chart body.',
    props: ['items', 'className'],
    related: ['ChartCard', 'ChartTooltipContent'],
    snippet: `<ChartLegend items={[{ id: 'new', label: 'New', colorClassName: 'bg-pos' }]} />`,
  }),
  defineComponent(ChartTooltipContent, {
    name: 'ChartTooltipContent', import: './components/charts', category: 'chart',
    purpose: 'Themed tooltip body: label, color-keyed rows, optional footer.',
    use_when: 'Rendering a custom chart tooltip via Recharts content prop.',
    props: ['label', 'rows', 'footer'],
    related: ['ChartLegend', 'ChartCard'],
    snippet: `<ChartTooltipContent label="Jan" rows={[{ label: 'Value', value: '$78k' }]} />`,
  }),
  defineComponent(ChartEmptyState, {
    name: 'ChartEmptyState', import: './components/charts', category: 'chart',
    purpose: 'Empty-state placeholder sized for a chart panel.',
    use_when: 'A chart has no data to render.',
    prefer_over: { EmptyState: 'Use EmptyState for general non-chart empty regions.' },
    props: ['title', 'description', 'action'],
    related: ['EmptyState', 'ChartCard'],
    snippet: `<ChartEmptyState title="No data" description="Adjust filters." />`,
  }),

  // ── maps ──────────────────────────────────────────────────────────────────
  defineComponent(RegionChoropleth, {
    name: 'RegionChoropleth', import: './components/maps', category: 'map',
    purpose: 'Choropleth map shading regions by a metric value.',
    use_when: 'Comparing a metric across geographic regions by fill intensity.',
    props: ['regions', 'features', 'selectedRegionId', 'onRegionSelect', 'valueLabel'],
    related: ['BubbleMap', 'FlowMap', 'GeoDrilldown'],
    snippet: `<RegionChoropleth regions={regions} onRegionSelect={select} />`,
  }),
  defineComponent(BubbleMap, {
    name: 'BubbleMap', import: './components/maps', category: 'map',
    purpose: 'Map plotting sized bubbles at point locations by a metric.',
    use_when: 'Showing magnitude at specific points (cities, sites).',
    props: ['points', 'regions', 'features', 'outlinePath', 'selectedPointId', 'onPointSelect', 'valueLabel'],
    related: ['RegionChoropleth', 'FlowMap', 'GeoDrilldown'],
    snippet: `<BubbleMap points={points} onPointSelect={select} />`,
  }),
  defineComponent(FlowMap, {
    name: 'FlowMap', import: './components/maps', category: 'map',
    purpose: 'Map drawing weighted flows between origin/destination points.',
    use_when: 'Visualizing movement or relationships between places.',
    props: ['flows', 'regions', 'features', 'outlinePath', 'selectedFlowId', 'onFlowSelect', 'valueLabel'],
    related: ['RegionChoropleth', 'BubbleMap', 'GeoDrilldown'],
    snippet: `<FlowMap flows={flows} onFlowSelect={select} />`,
  }),
  defineComponent(GeoDrilldown, {
    name: 'GeoDrilldown', import: './components/maps', category: 'map',
    purpose: 'Interactive region drilldown with title/description and selection state.',
    use_when: 'Letting the user select a region and inspect its detail.',
    props: ['regions', 'initialRegionId', 'onRegionChange', 'title', 'description'],
    related: ['RegionChoropleth', 'BubbleMap', 'FlowMap'],
    snippet: `<GeoDrilldown regions={regions} initialRegionId="ca" onRegionChange={onChange} />`,
  }),

  // ── DataGrid ──────────────────────────────────────────────────────────────
  defineComponent(DataGrid, {
    name: 'DataGrid', import: 'parts-bin/datagrid', category: 'datagrid',
    purpose: 'Headless-table-backed data grid: sort, filter, select, paginate, export, saved views, row pinning, cell-range copy/paste, inline editing, grouping, built-in/custom aggregation, tree rows, detail panels, and server query actions.',
    use_when: 'Displaying tabular records with interaction; the rows prop takes the data. Mark columns editable/groupable/aggregate, use aggregate functions for domain-specific summaries, use the row context menu for copy/pin actions, pass getSubRows for tree data, renderDetailPanel for master-detail rows, or manual* props for server-owned data.',
    props: ['rows', 'columns', 'getRowId', 'enableRowSelection', 'enablePagination', 'enableExport', 'enableExcelExport', 'exportFilename', 'allMatchingRowsSelected', 'onSelectAllMatching', 'onClearAllMatching', 'onExportAllCsv', 'onExportAllXlsx', 'persistenceKey', 'manualSorting', 'manualFiltering', 'manualPagination', 'totalRowCount', 'onQueryChange', 'loading', 'error', 'onContextChange', 'enableQuickFilter', 'quickFilterPlaceholder', 'enableGrouping', 'onRowUpdate', 'editMode', 'getSubRows', 'getRowCanExpand', 'renderDetailPanel', 'treeColumnId'],
    related: ['Pagination', 'FacetedFilter', 'AppliedFiltersBar'],
    snippet: `import { DataGrid, type DataGridColumn } from 'parts-bin/datagrid'

const columns: DataGridColumn<Product>[] = [
  { id: 'sku', accessorKey: 'sku', header: 'SKU' },
  { id: 'title', accessorKey: 'title', header: 'Title' },
]

<DataGrid rows={products} columns={columns} getRowId={(row) => row.id} />`,
  }),

  // ── chat ──────────────────────────────────────────────────────────────────
  defineComponent(AssistantPanel, {
    name: 'AssistantPanel', import: './components/chat', category: 'chat',
    purpose: 'Slide-over AI chat: empty state, streaming messages, composer — wired to any ChatAdapter.',
    use_when: 'An embedded AI assistant surface. Pass an adapter that streams from your product API.',
    prefer_over: { Drawer: 'Use Drawer for generic side panels; AssistantPanel for conversational AI surfaces.' },
    props: ['adapter', 'onClose', 'title', 'suggestions', 'chat'],
    related: ['ChatComposer', 'ChatMessageList'],
    snippet: `{open && <AssistantPanel adapter={adapter} suggestions={suggestions} onClose={close} />}`,
  }),
  defineComponent(ChatMessageList, {
    name: 'ChatMessageList', import: './components/chat', category: 'chat',
    purpose: 'Chat scroll container that follows streaming output and releases when the reader scrolls up.',
    use_when: 'Any custom chat layout; wrap ChatMessageBubble children.',
    props: ['children', 'className'],
    related: ['ChatMessageBubble'],
    snippet: `<ChatMessageList>{messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)}</ChatMessageList>`,
  }),
  defineComponent(ChatMessageBubble, {
    name: 'ChatMessageBubble', import: './components/chat', category: 'chat',
    purpose: 'One chat turn: user bubble, or assistant markdown with streaming cursor and error state.',
    use_when: 'Rendering ChatMessageData from useChat; pass MessageActions via the actions slot.',
    props: ['message', 'actions'],
    related: ['MessageActions', 'ChatMarkdown'],
    snippet: `<ChatMessageBubble message={m} actions={<MessageActions content={m.content} />} />`,
  }),
  defineComponent(ChatComposer, {
    name: 'ChatComposer', import: './components/chat', category: 'chat',
    purpose: 'Auto-growing chat input: Enter sends, Shift+Enter newlines, send morphs to Stop while streaming.',
    use_when: 'The input row of any chat surface.',
    props: ['onSend', 'streaming', 'onStop', 'placeholder', 'autoFocus'],
    snippet: `<ChatComposer onSend={send} streaming={status === 'streaming'} onStop={stop} />`,
  }),
  defineComponent(ChatMarkdown, {
    name: 'ChatMarkdown', import: './components/chat', category: 'chat',
    purpose: 'Token-styled markdown renderer (GFM tables, lists, links, fenced code via CodeBlock).',
    use_when: 'Rendering LLM output anywhere; re-skins with the theme tokens.',
    prefer_over: { CodeBlock: 'Use CodeBlock directly only for standalone code; ChatMarkdown routes fenced blocks to it.' },
    props: ['content'],
    related: ['CodeBlock'],
    snippet: `<ChatMarkdown content={assistantText} />`,
  }),
  defineComponent(CodeBlock, {
    name: 'CodeBlock', import: './components/chat', category: 'chat',
    purpose: 'Themed monospace code block with language label and copy-to-clipboard.',
    use_when: 'Showing code outside markdown. No syntax highlighting by design (token boundary).',
    props: ['code', 'language'],
    snippet: `<CodeBlock code={'npm run dev'} language="bash" />`,
  }),
  defineComponent(MessageActions, {
    name: 'MessageActions', import: './components/chat', category: 'chat',
    purpose: 'Copy / regenerate / feedback action row for a completed assistant message.',
    use_when: 'The actions slot of ChatMessageBubble.',
    props: ['content', 'onRegenerate', 'onFeedback'],
    related: ['ChatMessageBubble'],
    snippet: `<MessageActions content={m.content} onRegenerate={regenerate} onFeedback={(k) => track(k)} />`,
  }),
  defineComponent(SuggestedPrompts, {
    name: 'SuggestedPrompts', import: './components/chat', category: 'chat',
    purpose: 'Clickable prompt chips for a chat empty state.',
    use_when: 'Seeding a conversation with example questions.',
    props: ['prompts', 'onSelect'],
    snippet: `<SuggestedPrompts prompts={DEMO_SUGGESTIONS} onSelect={send} />`,
  }),

  // ── shell ─────────────────────────────────────────────────────────────────
  defineComponent(AppShell, {
    name: 'AppShell', import: './components/shell', category: 'shell',
    purpose: 'Top-level layout frame composing a sidebar, top nav, and content.',
    use_when: 'The outermost application chrome around routed pages.',
    props: ['sidebar', 'topNav', 'children'],
    related: ['Sidebar', 'TopNav'],
    snippet: `<AppShell sidebar={<Sidebar brand={brand} items={nav} />} topNav={<TopNav title="Projects" />}>{page}</AppShell>`,
  }),
  defineComponent(Sidebar, {
    name: 'Sidebar', import: './components/shell', category: 'shell',
    purpose: 'Primary left navigation with brand lockup, nav items, and footer.',
    use_when: 'The app-level navigation rail inside AppShell.',
    props: ['brand', 'items', 'footer'],
    related: ['AppShell', 'TopNav', 'Breadcrumbs'],
    snippet: `<Sidebar brand={<Logo />} items={[{ label: 'Projects', href: '/projects', active: true }]} />`,
  }),
  defineComponent(TopNav, {
    name: 'TopNav', import: './components/shell', category: 'shell',
    purpose: 'Top app bar with breadcrumbs, title, and actions slot.',
    use_when: 'The header band above page content inside AppShell.',
    props: ['breadcrumbs', 'title', 'actions'],
    related: ['AppShell', 'Breadcrumbs', 'Sidebar'],
    snippet: `<TopNav title="Projects" actions={<Button>New</Button>} />`,
  }),
  defineComponent(Breadcrumbs, {
    name: 'Breadcrumbs', import: './components/shell', category: 'shell',
    purpose: 'Hierarchical breadcrumb trail of links.',
    use_when: 'Showing the user where they are in a nested navigation hierarchy.',
    props: ['items'],
    related: ['TopNav'],
    snippet: `<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects' }]} />`,
  }),
  defineComponent(FilterBar, {
    name: 'FilterBar', import: './components/shell', category: 'shell',
    purpose: 'Bar holding filter controls with a trailing actions slot.',
    use_when: 'A dedicated row of filter inputs above a list or grid.',
    props: ['children', 'actions'],
    related: ['Toolbar', 'AppliedFiltersBar', 'FacetedFilter'],
    snippet: `<FilterBar actions={<Button>Reset</Button>}><FacetedFilter {...facet} /></FilterBar>`,
  }),
  defineComponent(SectionHeader, {
    name: 'SectionHeader', import: './components/shell', category: 'shell',
    purpose: 'Section-level heading with title, description, and actions.',
    use_when: 'Introducing a section within a page (below PageHeader).',
    props: ['title', 'description', 'actions'],
    related: ['PageHeader', 'Card'],
    snippet: `<SectionHeader title="Open requests" actions={<Button>Export</Button>} />`,
  }),
  defineComponent(SettingsPanel, {
    name: 'SettingsPanel', import: './components/shell', category: 'shell',
    purpose: 'Titled settings card grouping related setting controls.',
    use_when: 'A section of a settings page.',
    props: ['title', 'description', 'children'],
    related: ['Card', 'SectionHeader'],
    snippet: `<SettingsPanel title="Notifications">{controls}</SettingsPanel>`,
  }),
  defineComponent(NotificationBadge, {
    name: 'NotificationBadge', import: './components/shell', category: 'data-display',
    purpose: 'Small count badge (caps at 9+) for unread/pending items.',
    use_when: 'Overlaying a numeric count on an icon or nav item.',
    prefer_over: { StatusBadge: 'Use StatusBadge for a status tone label, not a count.' },
    props: ['count'],
    related: ['StatusBadge'],
    snippet: `<NotificationBadge count={12} />`,
  }),

  // ── top-level components ──────────────────────────────────────────────────
  defineComponent(KpiCard, {
    name: 'KpiCard', import: './components', category: 'data-display',
    purpose: 'Headline KPI tile: label, value, delta, and an inline sparkline.',
    use_when: 'A top-level metric tile for dashboards, reports, or operational summaries.',
    prefer_over: { Metric: 'Use Metric for a compact inline stat without a sparkline.' },
    props: ['label', 'value', 'delta', 'spark', 'negSpark'],
    related: ['KpiSummaryRow', 'Metric', 'Sparkline'],
    snippet: `<KpiCard label="Total value" value="$78.3k" delta={4.2} spark={series} />`,
  }),
  defineComponent(KpiSummaryRow, {
    name: 'KpiSummaryRow', import: './components', category: 'data-display',
    purpose: 'Responsive row container that lays out a set of KpiCards.',
    use_when: 'Arranging KPI tiles across the top of a report or dashboard.',
    props: ['children', 'className'],
    related: ['KpiCard'],
    snippet: `<KpiSummaryRow><KpiCard {...a} /><KpiCard {...b} /></KpiSummaryRow>`,
  }),
  defineComponent(Sparkline, {
    name: 'Sparkline', import: './components', category: 'data-display',
    purpose: 'Tiny inline trend line for a numeric series.',
    use_when: 'A minimal trend indicator inside a card, cell, or KPI.',
    props: ['data', 'neg', 'width', 'height'],
    related: ['KpiCard', 'LoadingSparkline'],
    snippet: `<Sparkline data={[1, 3, 2, 5, 4]} />`,
  }),
  defineComponent(ConfirmDialog, {
    name: 'ConfirmDialog', import: './components', category: 'overlay',
    purpose: 'Modal preset for a destructive/confirm decision with cancel and confirm.',
    use_when: 'Confirming a single irreversible action like delete.',
    prefer_over: { Modal: 'Use Modal directly for non-confirm dialogs or richer content.' },
    props: ['title', 'message', 'confirmLabel', 'onCancel', 'onConfirm'],
    related: ['Modal'],
    snippet: `<ConfirmDialog title="Delete project?" message="This cannot be undone." onCancel={close} onConfirm={del} />`,
  }),
]
