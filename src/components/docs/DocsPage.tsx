import { useMemo, useState, type ReactNode } from 'react'
import {
  ActivityFeed,
  AppliedFiltersBar,
  AssigneeChip,
  AttachmentList,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  Combobox,
  CommandPalette,
  DateRangePicker,
  DescriptionList,
  DetailHeader,
  Drawer,
  Dropzone,
  DropdownMenu,
  EmptyState,
  FacetedFilter,
  Field,
  IconButton,
  ImportProgress,
  InlineAlert,
  Input,
  KeyValueList,
  LoadingBars,
  LoadingChartDrawIn,
  LoadingConcentricArcs,
  LoadingCountingMetric,
  LoadingDonut,
  LoadingDots,
  LoadingKpiSkeleton,
  LoadingProgress,
  LoadingSparkline,
  MetadataPanel,
  Metric,
  PageHeader,
  Pagination,
  Popover,
  RadioGroup,
  SegmentedControl,
  Select,
  Skeleton,
  Spinner,
  StatusBadge,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  Timeline,
  Toolbar,
  Tooltip,
  type CommandPaletteGroup,
  type DateRange,
} from '../ui'
import {
  ChartCard,
  ChartEmptyState,
  ChartLegend,
  ChartTooltipContent,
} from '../charts'
import { FilterBar, SectionHeader, SettingsPanel } from '../shell'
import {
  THEME_RECIPES,
  applyThemeRecipe,
  readStoredThemeRecipe,
  themeRecipeUsageSnippet,
  type ThemeRecipeId,
} from '../../theme/recipes'

const usageSnippet = `import { Button, Card, Field, Input } from './components/ui'
import { AppShell, Sidebar, TopNav } from './components/shell'

export function AccountsScreen() {
  return (
    <Card title="Account details">
      <Field label="Name" required>
        <Input placeholder="Cobalt Freight" />
      </Field>
    </Card>
  )
}`

const stylingSnippet = `<div className="border border-line bg-surface text-ink">
  <span className="micro">Theme safe</span>
</div>`

const chartsUsageSnippet = `import { WaterfallChart, buildWaterfallData } from './components/charts'

// Charts derive color and axes from src/theme/chart-theme.ts only.
const steps = [
  { kind: 'start', label: 'Open MRR', value: 60000 },
  { kind: 'increase', label: 'New', value: 12000 },
  { kind: 'decrease', label: 'Churn', value: -4000 },
  { kind: 'total', label: 'Close MRR' },
]

export function Movement() {
  return <WaterfallChart data={steps} ariaLabel="MRR movement" />
}`

const dataGridUsageSnippet = `import { DataGrid, toGridQuery, type GridQuery } from './components/DataGrid'

<DataGrid
  rows={accounts}
  columns={columns}
  getRowId={(a) => a.id}
  enableRowSelection
  enableHeaderFilters
  enablePagination
  enableExport
  onQueryChange={(q: GridQuery) => fetchAccounts(q)}
/>`

const copyChecklist: Array<[string, string]> = [
  ['Theme', 'Copy src/theme/ and import theme/theme.css at your root. Re-skin via tokens.css only.'],
  ['Primitives', 'Copy src/components/ui/ and import from the ./ui barrel (Button, Field, Drawer, IconButton, InlineAlert, SegmentedControl, …).'],
  ['Shell', 'Copy src/components/shell/ for the app shell, sidebar, top nav, and filter bars.'],
  ['Charts & DataGrid', 'Copy src/components/charts/ and src/components/DataGrid/; import from the ./charts and ./DataGrid barrels.'],
  ['Boundary', 'Copy scripts/lint-theme.mjs and wire npm run lint:theme so raw colors never leak outside src/theme/.'],
]

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

const activityItems = [
  { id: 'renewal', title: 'Renewal reviewed', description: 'Success plan updated before the Q3 renewal call.', actor: 'Avery Cohen', timestamp: '2h ago', tone: 'positive' as const },
  { id: 'risk', title: 'Risk flag added', description: 'Usage fell below the weekly active threshold.', actor: 'Blair Nakamura', timestamp: 'Yesterday', tone: 'warning' as const },
]

const accountDetailItems = [
  { label: 'Owner', value: 'Avery Cohen', description: 'Customer success lead' },
  { label: 'Plan', value: 'Enterprise' },
  { label: 'Renewal', value: 'September 30, 2026' },
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

const chartLegendItems = [
  { id: 'enterprise', label: 'Enterprise', value: '$48.2k', colorClassName: 'bg-accent' },
  { id: 'midmarket', label: 'Mid-market', value: '$22.4k', colorClassName: 'bg-intel' },
  { id: 'startup', label: 'Startup', value: '$13.6k', colorClassName: 'bg-review' },
]

interface PropReferenceRow {
  component: string
  props: string
  variants: string
  accessibility: string
}

const uiPropRows: PropReferenceRow[] = [
  {
    component: 'Button',
    props: 'variant, size, disabled, type, onClick',
    variants: 'primary, secondary, ghost, destructive / default, compact',
    accessibility: 'Native button semantics; labels stay nowrap; disabled uses native disabled state.',
  },
  {
    component: 'Field',
    props: 'label, id, hint, error, required, disabled, layout',
    variants: 'vertical, horizontal; hint or error description',
    accessibility: 'Auto-generates input id, label association, aria-describedby, aria-invalid, required, and disabled when wrapping one control.',
  },
  {
    component: 'Input / Select / Textarea',
    props: 'standard native control props plus className',
    variants: 'token-backed default, focused, placeholder, disabled',
    accessibility: 'Prefer Field for generated labels and descriptions; native keyboard behavior is preserved.',
  },
  {
    component: 'Checkbox / Switch',
    props: 'label, hint, checked, disabled, onChange',
    variants: 'checked, unchecked, disabled; Switch uses role=switch',
    accessibility: 'Label wraps the input; visual switch track is pointer-safe and the input owns the hit area.',
  },
  {
    component: 'Tabs',
    props: 'items, value, defaultValue, onValueChange, label',
    variants: 'controlled or uncontrolled; disabled tab items',
    accessibility: 'role=tablist/tab/tabpanel, aria-controls, roving focus, Arrow/Home/End keyboard navigation.',
  },
  {
    component: 'DropdownMenu',
    props: 'label, items, align',
    variants: 'start/end alignment; disabled and destructive items; optional descriptions',
    accessibility: 'role=menu/menuitem, Arrow/Home/End navigation, Enter/Space select, Escape close, focus returns to trigger.',
  },
  {
    component: 'Popover',
    props: 'trigger, align, className, children',
    variants: 'start/end alignment; arbitrary dialog content',
    accessibility: 'Trigger owns aria-expanded/aria-controls; panel is role=dialog; Escape closes and restores focus.',
  },
  {
    component: 'Tooltip',
    props: 'content, side, children',
    variants: 'top, bottom',
    accessibility: 'Adds aria-describedby to a focusable trigger and reveals on hover or focus.',
  },
  {
    component: 'Card / Metric / EmptyState / Skeleton',
    props: 'title, description, actions, value, status, action, className',
    variants: 'neutral, positive, negative, warning, intelligence, review, reject',
    accessibility: 'Use semantic headings/actions; Skeleton is aria-hidden; EmptyState action remains an explicit command.',
  },
  {
    component: 'IconButton',
    props: 'variant, size, aria-label (required), disabled, onClick',
    variants: 'primary, secondary, ghost, destructive / default, compact; square',
    accessibility: 'Wraps Button; requires aria-label because the control is icon-only.',
  },
  {
    component: 'SegmentedControl',
    props: 'options, value, defaultValue, onValueChange, size, label',
    variants: 'controlled or uncontrolled; disabled options; default, compact',
    accessibility: 'role=radiogroup/radio, aria-checked, roving focus, Arrow/Home/End navigation.',
  },
  {
    component: 'InlineAlert',
    props: 'tone, title, action, onDismiss, children',
    variants: 'accent, pos, neg, warn; optional title, action, dismiss',
    accessibility: 'role=alert for neg/warn, role=status otherwise; dismiss is a labeled IconButton.',
  },
  {
    component: 'Drawer',
    props: 'title, onClose, footer, side, children',
    variants: 'right or left side panel; optional footer',
    accessibility: 'role=dialog, aria-modal, labelled by title; Escape closes, Tab cycles, focus restores to opener.',
  },
  {
    component: 'Combobox',
    props: 'options, value, defaultValue, onValueChange, placeholder, emptyMessage, disabled',
    variants: 'single-select, type-to-filter; strict select-from-list; integrates with Field',
    accessibility: 'role=combobox + listbox/option, aria-expanded, aria-activedescendant; focus stays on the input.',
  },
  {
    component: 'CommandPalette',
    props: 'groups, open, onOpenChange, trigger, placeholder',
    variants: 'global Ctrl+K launcher, grouped commands, disabled commands, shortcuts, filtered results',
    accessibility: 'role=dialog containing a combobox/listbox command surface; Arrow keys move, Enter selects, Escape closes.',
  },
  {
    component: 'DatePicker / DateRangePicker',
    props: 'label, value, onValueChange, presets',
    variants: 'native date input, compact range trigger, preset buttons, invalid inverted range state',
    accessibility: 'Native date inputs keep platform semantics; the range popover is role=dialog and closes with Escape.',
  },
  {
    component: 'RadioGroup',
    props: 'options, value, defaultValue, onValueChange, name, label, hint, error, orientation',
    variants: 'vertical or horizontal; per-option description; disabled options; controlled or uncontrolled',
    accessibility: 'Native radios in a role=radiogroup; own label/hint/error wire aria-labelledby/describedby/invalid.',
  },
  {
    component: 'Spinner',
    props: 'size, label, className',
    variants: 'sm, default, lg; decorative when label is empty',
    accessibility: 'role=status with a label by default; inherits text color via currentColor (theme-safe).',
  },
  {
    component: 'Button / IconButton (loading)',
    props: 'loading',
    variants: 'pending state shows a spinner',
    accessibility: 'loading sets aria-busy and disables the control so it cannot be activated.',
  },
  {
    component: 'FilterChip / AppliedFiltersBar / FacetedFilter',
    props: 'filters, onClearAll, options, selectedValues, onSelectedValuesChange',
    variants: 'removable chips, empty state, searchable facet menu, selected counts, clear all',
    accessibility: 'Chips use labeled remove buttons; FacetedFilter is a dialog trigger with native checkboxes and clear-all control.',
  },
  {
    component: 'ActivityFeed / Timeline / AuditLogItem / EventRow',
    props: 'items, title, actor, timestamp, tone, actions, resource',
    variants: 'neutral, positive, warning, negative, accent; feed, timeline, and audit row layouts',
    accessibility: 'Events render as articles with headings; timeline order stays list-based and readable without color.',
  },
  {
    component: 'DetailHeader / KeyValueList / DescriptionList / PropertyGrid / MetadataPanel',
    props: 'title, subtitle, meta, status, actions, items, columns, footer',
    variants: 'detail page header, single-column key/value rows, multi-column property panels, metadata aside',
    accessibility: 'Detail fields use dl/dt/dd semantics and preserve explicit page/detail headings.',
  },
  {
    component: 'Stepper / WizardLayout',
    props: 'steps, currentStepId, onStepSelect, state, onBack, onNext, nextDisabled',
    variants: 'horizontal or vertical; complete, current, upcoming, and error states; guided wizard shell',
    accessibility: 'Current steps expose aria-current=step; selectable steps are native buttons.',
  },
  {
    component: 'Dropzone / FileUpload / AttachmentList / ImportProgress',
    props: 'accept, multiple, onFilesSelected, files, attachments, value',
    variants: 'drag target, browse button, removable attachment rows, bounded progress bar',
    accessibility: 'Browse uses a native file input; ImportProgress exposes progressbar bounds and current value.',
  },
  {
    component: 'Avatar / AvatarGroup / PresenceBadge / AssigneeChip',
    props: 'name, src, initials, size, status, users, max, meta, onRemove',
    variants: 'sm, md, lg; online, away, busy, offline; overflow count; removable assignee chip',
    accessibility: 'Avatars keep names available to assistive tech; presence status has screen-reader text.',
  },
  {
    component: 'LoadingKpiSkeleton / LoadingProgress / LoadingDots',
    props: 'label, className, detail, tone',
    variants: 'KPI skeleton, chart draw-in, donut, bars, sparkline, dots, progress, counting metric, concentric arcs',
    accessibility: 'Each animation exposes role=status by default and becomes decorative when label is empty.',
  },
]

const shellPropRows: PropReferenceRow[] = [
  {
    component: 'AppShell',
    props: 'sidebar, topNav, children',
    variants: 'with or without sidebar/top navigation',
    accessibility: 'Composes landmarks from Sidebar, TopNav, and page-level main content.',
  },
  {
    component: 'LeftNavigationDrawer',
    props: 'brand, brandMark, items, adminItems, footer, collapsed, onCollapsedChange',
    variants: 'expanded, collapsed, active item, admin section, item meta, footer status',
    accessibility: 'Primary nav landmark; active links set aria-current=page and the collapse control has an explicit label.',
  },
  {
    component: 'BrandLockup',
    props: 'children, href, collapsed, mark',
    variants: 'full lockup, collapsed mark-only presentation',
    accessibility: 'Brand remains a link; collapsed text is visually hidden instead of removed from assistive tech.',
  },
  {
    component: 'NavigationItem / ActiveNavigationItem',
    props: 'label, href, active, meta, collapsed',
    variants: 'default, active, collapsed, meta count',
    accessibility: 'Active links set aria-current=page; collapsed links keep title text for pointer users.',
  },
  {
    component: 'AdminSectionDivider / AdminNavigationItem',
    props: 'label, collapsed / label, href, active, meta, collapsed',
    variants: 'admin label, admin item, collapsed section',
    accessibility: 'Admin navigation keeps the same link semantics as primary navigation.',
  },
  {
    component: 'CollapseSidebarControl',
    props: 'collapsed, onClick',
    variants: 'expand, collapse',
    accessibility: 'Button labels switch between Expand sidebar and Collapse sidebar.',
  },
  {
    component: 'TopNav / Breadcrumbs',
    props: 'breadcrumbs, title, actions / items',
    variants: 'linked ancestors, current page label, action cluster',
    accessibility: 'Header landmark plus Breadcrumb nav; current crumb renders as text instead of a link.',
  },
  {
    component: 'TimePeriodSelector / CalendarIconButton / FilterButton',
    props: 'value, options, onChange / label, onClick / label, pressed, onClick',
    variants: 'period select, calendar icon action, pressed filter state',
    accessibility: 'Controls use native select or button semantics and expose text labels for compact icon surfaces.',
  },
  {
    component: 'GlobalSearchInput / NotificationButton / UserAvatarMenu',
    props: 'input props / count, onClick / name, initials, items, meta',
    variants: 'searchbox, badged notification button, avatar-triggered menu',
    accessibility: 'Search keeps a visible or aria label; notification count is reflected in the button label; avatar menu uses DropdownMenu semantics.',
  },
  {
    component: 'PageHeader / SectionHeader',
    props: 'eyebrow, title, description, actions',
    variants: 'page-scale and section-scale headers',
    accessibility: 'Keeps page and section headings explicit; actions are kept from shrinking into the title copy.',
  },
  {
    component: 'Toolbar / FilterBar',
    props: 'leading, trailing, actions, children',
    variants: 'command toolbar, filter strip, trailing action cluster',
    accessibility: 'Use native controls inside; keep labels visible or attach aria-labels for compact controls.',
  },
  {
    component: 'SettingsPanel',
    props: 'title, description, children',
    variants: 'page-level or side-panel configuration',
    accessibility: 'Aside landmark-friendly surface for persistent settings and grouped Fields.',
  },
]

const interactionRows = [
  ['Modal', 'Escape closes; Tab and Shift+Tab stay inside; close restores opener focus.'],
  ['Drawer', 'Same as Modal: Escape closes; Tab cycles inside the panel; focus restores to the opener.'],
  ['DropdownMenu', 'Arrow keys skip disabled items; Home/End jump; Enter/Space selects; Escape restores trigger focus.'],
  ['Combobox', 'Type to filter; Arrow keys move the active option; Enter selects; Escape closes and reverts.'],
  ['CommandPalette', 'Ctrl+K opens globally; type to filter; Arrow keys move; Enter runs the active command; Escape closes.'],
  ['DateRangePicker', 'Trigger opens a dialog; native date inputs edit bounds; presets set drafts; Apply commits valid ranges.'],
  ['Tabs / SegmentedControl', 'Arrow keys, Home, and End move the active item and focus together.'],
  ['RadioGroup', 'Native radios: Tab reaches the group, Arrow keys move the selection within it.'],
  ['Popover', 'Escape closes and returns focus to the trigger.'],
  ['Tooltip', 'Hover and keyboard focus reveal the same content; trigger is described by the tooltip.'],
  ['Field', 'Label, hint, error, required, disabled, and invalid states are wired for single wrapped controls.'],
  ['FacetedFilter', 'Trigger opens a filter dialog; native checkboxes toggle facets; Clear all removes selected values.'],
  ['Stepper / WizardLayout', 'Selectable steps use buttons; current step is announced with aria-current=step; Back and Continue are explicit commands.'],
  ['Dropzone', 'Drag and drop files or use the Browse button, which forwards to a native file input.'],
]

const chartPropRows: PropReferenceRow[] = [
  {
    component: 'ChartCard / ChartLegend / ChartTooltipContent / ChartEmptyState',
    props: 'title, description, metric, actions, items, rows, label, action',
    variants: 'chart shell, custom legend, themed tooltip body, empty chart placeholder',
    accessibility: 'Chart scaffolds keep titles and empty states semantic while leaving chart internals to Recharts or custom renderers.',
  },
  {
    component: 'WaterfallChart',
    props: 'data (WaterfallStepInput[]), ariaLabel, height, minWidth, barWidth, valueFormatter',
    variants: 'start / increase / decrease / total steps; start–net–end summary header',
    accessibility: 'Renders a figure with ariaLabel; bars and axes are themed only via src/theme/chart-theme.ts.',
  },
  {
    component: 'RevenueMovementChart',
    props: 'barWidth, showLabels',
    variants: 'token-backed bar width (REVENUE_MOVEMENT_BAR_WIDTH_RANGE); optional smart value labels',
    accessibility: 'Bars use SERIES[0] = var(--accent); width is configurable, never a raw color.',
  },
  {
    component: 'MrrShareDonut',
    props: 'accounts',
    variants: 'segment ring with a centered metric',
    accessibility: 'Ring + center metric; segment colors come from the chart palette only.',
  },
  {
    component: 'MrrTrendChart',
    props: '— (reads the seeded demo series)',
    variants: 'single trend line, no dots',
    accessibility: 'Line style (1.75px, no dots) and axes come from chart-theme.ts.',
  },
  {
    component: 'buildWaterfallData()',
    props: 'steps: WaterfallStepInput[] → WaterfallBuildResult',
    variants: 'pure helper returning { data, summary } for WaterfallChart',
    accessibility: 'Pure function, no DOM — keeps chart math out of components and unit-testable.',
  },
]

const dataGridPropRows: PropReferenceRow[] = [
  {
    component: 'DataGrid',
    props: 'rows, columns, getRowId, initialState, state, onStateChange',
    variants: 'controlled or uncontrolled state; loading and error surfaces',
    accessibility: 'Headless TanStack Table with native table semantics, sortable headers, and selection.',
  },
  {
    component: 'DataGrid (features)',
    props: 'enableRowSelection, enableHeaderFilters, enablePagination, enableExport, enableSavedViews',
    variants: 'opt-in selection, header filters, pagination, CSV/TSV export, saved views',
    accessibility: 'Every feature is off by default; each control exposes labels and keyboard interaction.',
  },
  {
    component: 'DataGrid (server mode)',
    props: 'manualSorting, manualFiltering, manualPagination, totalRowCount, onQueryChange, persistenceKey',
    variants: 'client-side, or server-driven via toGridQuery + a server adapter',
    accessibility: 'onQueryChange emits a serializable GridQuery; createMockServerAdapter demonstrates fetching.',
  },
  {
    component: 'LedgerGridColumn',
    props: 'id, header, accessor/cell, align, width, sortable, hideable, meta.type',
    variants: 'text / number / status column types; pinned, hidden, resizable',
    accessibility: 'Column meta drives alignment and filter UI; numerals right-align on the mono num scale.',
  },
  {
    component: 'GridQuery',
    props: 'sorting, columnFilters, globalFilter, pagination',
    variants: 'toGridQuery(state) builds it; serializeGridQuery() makes it URL-safe',
    accessibility: 'Plain serializable object — the boundary between grid state and your data layer.',
  },
]

function Snippet({ code }: { code: string }) {
  return (
    <pre className="max-w-full min-w-0 overflow-auto border border-line bg-surface-2 p-3 text-[12px] text-ink">
      <code>{code}</code>
    </pre>
  )
}

function PropReferenceTable({ rows }: { rows: PropReferenceRow[] }) {
  return (
    <div className="max-w-full min-w-0 overflow-x-auto">
      <table className="min-w-[760px] w-full border-collapse text-left text-[13px]">
        <thead className="bg-surface-2">
          <tr className="border-b border-line">
            <th className="micro px-3 py-2">Component</th>
            <th className="micro px-3 py-2">Key props</th>
            <th className="micro px-3 py-2">Variants / states</th>
            <th className="micro px-3 py-2">Accessibility contract</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.component} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-3 py-3 align-top font-semibold text-ink">{row.component}</th>
              <td className="px-3 py-3 align-top text-muted"><code className="num text-ink">{row.props}</code></td>
              <td className="px-3 py-3 align-top text-muted">{row.variants}</td>
              <td className="px-3 py-3 align-top text-muted">{row.accessibility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExampleBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <div className="grid gap-4">{children}</div>
    </Card>
  )
}

export function DocsPage() {
  const [switchOn, setSwitchOn] = useState(true)
  const [checked, setChecked] = useState(true)
  const [page, setPage] = useState(1)
  const [density, setDensity] = useState('standard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [warnAlertOpen, setWarnAlertOpen] = useState(true)
  const [owner, setOwner] = useState('')
  const [plan, setPlan] = useState('pro')
  const [saving, setSaving] = useState(false)
  const [selectedSegments, setSelectedSegments] = useState(['enterprise'])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [commandResult, setCommandResult] = useState('No command run')
  const [docsDateRange, setDocsDateRange] = useState<DateRange>({ start: '2026-06-01', end: '2026-06-08' })
  const [recipeId, setRecipeId] = useState<ThemeRecipeId>(() => readStoredThemeRecipe())
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
  const appliedFilters = selectedSegments.map((segment) => ({
    id: segment,
    label: 'Segment',
    value: segmentFilterOptions.find((option) => option.value === segment)?.label ?? segment,
    onRemove: () => setSelectedSegments((current) => current.filter((value) => value !== segment)),
  }))

  const simulateSave = () => {
    setSaving(true)
    window.setTimeout(() => setSaving(false), 1200)
  }

  const selectRecipe = (nextRecipeId: ThemeRecipeId) => {
    setRecipeId(nextRecipeId)
    applyThemeRecipe(nextRecipeId)
  }

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-6">
      <PageHeader
        eyebrow="Ledger UI Kit"
        title="Component reference"
        description="Live primitives, shell patterns, prop guidance, and copy-paste starting points for building internal tools without pulling in MUI."
        actions={<Button variant="primary" onClick={() => { window.location.href = '/' }}>Open dashboard</Button>}
      />

      <div className="grid gap-6">
        <Card title="Copy Ledger into your app" description="Ledger is a clone-and-customize kit, not an npm package. Copy the theme, primitives, shell, charts, and DataGrid — plus the lint rule — into the app you are building.">
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Snippet code={usageSnippet} />
              <div className="grid content-start gap-3 text-[13px] text-muted">
                <p className="m-0">Public API: import from the barrels <code className="num text-ink">src/components/ui</code>, <code className="num text-ink">shell</code>, <code className="num text-ink">charts</code>, and <code className="num text-ink">DataGrid</code> — or the aggregate <code className="num text-ink">src/components</code>.</p>
                <p className="m-0">Theme boundary: style with token utilities like <code className="num text-ink">bg-surface</code>, <code className="num text-ink">text-ink</code>, and <code className="num text-ink">border-line</code>.</p>
                <p className="m-0">Packaging story: keep Ledger copy-paste first until the API hardens across two or three real cloned apps.</p>
              </div>
            </div>
            <ol className="m-0 grid list-none gap-2 p-0">
              {copyChecklist.map(([step, detail], index) => (
                <li key={step} className="flex items-start gap-3 border border-line bg-surface-2 p-3 text-[13px]">
                  <span className="num shrink-0 text-muted">{index + 1}</span>
                  <span><span className="font-semibold text-ink">{step}.</span> <span className="text-muted">{detail}</span></span>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <Card title="Component API reference" description="Stable prop names, variants, states, and accessibility contracts for the copy-paste kit. Keep values token-backed and preserve native control semantics.">
          <Tabs
            label="Component API reference"
            items={[
              {
                id: 'ui',
                label: 'UI primitives',
                content: <PropReferenceTable rows={uiPropRows} />,
              },
              {
                id: 'shell',
                label: 'Shell primitives',
                content: <PropReferenceTable rows={shellPropRows} />,
              },
              {
                id: 'keyboard',
                label: 'Keyboard',
                content: (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[13px]">
                      <thead className="bg-surface-2">
                        <tr className="border-b border-line">
                          <th className="micro px-3 py-2">Surface</th>
                          <th className="micro px-3 py-2">Interaction contract</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interactionRows.map(([surface, contract]) => (
                          <tr key={surface} className="border-b border-line last:border-b-0">
                            <th scope="row" className="px-3 py-3 align-top font-semibold text-ink">{surface}</th>
                            <td className="px-3 py-3 align-top text-muted">{contract}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Charts API" description="Recharts-based charts that take data in and derive every color, axis, and gridline from src/theme/chart-theme.ts. Import from src/components/charts.">
          <div className="grid gap-4">
            <PropReferenceTable rows={chartPropRows} />
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <ChartCard
                title="Generic chart scaffold"
                description="Use ChartCard around arbitrary product charts."
                metric="$84.2k"
              >
                <div className="grid gap-3">
                  <div className="grid h-36 content-end gap-1 border border-line bg-surface-2 p-3" aria-label="Example chart bars">
                    <span className="h-16 bg-accent" />
                    <span className="h-24 bg-intel" />
                    <span className="h-10 bg-review" />
                  </div>
                  <ChartLegend items={chartLegendItems} />
                </div>
              </ChartCard>
              <div className="grid gap-4">
                <ChartTooltipContent
                  label="June"
                  rows={[
                    { label: 'Enterprise', value: '$48.2k', colorClassName: 'bg-accent' },
                    { label: 'Mid-market', value: '$22.4k', colorClassName: 'bg-intel' },
                  ]}
                  footer="Tooltip content is reusable outside Recharts."
                />
                <ChartEmptyState title="No trend yet" description="Add account revenue to draw this chart." />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Snippet code={chartsUsageSnippet} />
              <div className="grid content-start gap-3 text-[13px] text-muted">
                <p className="m-0"><code className="num text-ink">SERIES[0]</code> is <code className="num text-ink">var(--accent)</code>, so the primary series re-skins with the accent token. Categorical <code className="num text-ink">SERIES[1..]</code> are fixed and documented in chart-theme.ts.</p>
                <p className="m-0">Keep chart math in helpers like <code className="num text-ink">buildWaterfallData()</code> so the chart components stay declarative and the logic stays unit-tested.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="DataGrid API" description="A headless TanStack Table grid with sort, filter, column visibility/reorder, selection, export, and saved views. Import from src/components/DataGrid.">
          <div className="grid gap-4">
            <PropReferenceTable rows={dataGridPropRows} />
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Snippet code={dataGridUsageSnippet} />
              <div className="grid content-start gap-3 text-[13px] text-muted">
                <p className="m-0">Features are opt-in props. Leave them off for a plain read-only table; switch on <code className="num text-ink">enableRowSelection</code>, <code className="num text-ink">enableHeaderFilters</code>, <code className="num text-ink">enableExport</code>, and <code className="num text-ink">enableSavedViews</code> as you need them.</p>
                <p className="m-0">For server data, set the <code className="num text-ink">manual*</code> flags and read <code className="num text-ink">onQueryChange</code> — it emits a serializable <code className="num text-ink">GridQuery</code> you can hand to your fetch layer.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Theme recipes" description="Preview and apply token recipes without touching component files. Recipes are just CSS variable overrides in src/theme/recipes.css.">
          <div className="grid gap-4">
            <div className="grid gap-3 lg:grid-cols-4">
              {THEME_RECIPES.map((recipe) => (
                <article
                  key={recipe.id}
                  data-theme-preview={recipe.id}
                  className="grid gap-3 border border-line bg-bg p-3 text-ink"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <h3 className="m-0 text-[14px] font-semibold text-ink">{recipe.name}</h3>
                      <p className="m-0 text-[12px] text-muted">{recipe.description}</p>
                    </div>
                    <span className="h-5 w-5 shrink-0 rounded-[2px] border border-line bg-accent" aria-hidden="true" />
                  </div>
                  <div className="grid gap-2 border border-line bg-surface p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="micro">MRR</span>
                      <span className="num text-pos">+4.6%</span>
                    </div>
                    <div className="display text-[22px] font-semibold text-ink">$84.2k</div>
                    <div className="grid grid-cols-5 gap-1" aria-label="Token swatches">
                      <span className="h-2 flex-1 bg-accent" />
                      <span className="h-2 flex-1 bg-intel" />
                      <span className="h-2 flex-1 bg-pos" />
                      <span className="h-2 flex-1 bg-review" />
                      <span className="h-2 flex-1 bg-reject" />
                    </div>
                  </div>
                  <p className="m-0 text-[12px] text-muted">{recipe.bestFor}</p>
                  <Button
                    size="compact"
                    variant={recipe.id === recipeId ? 'primary' : 'secondary'}
                    onClick={() => selectRecipe(recipe.id)}
                  >
                    {recipe.id === recipeId ? 'Applied' : 'Apply to demo'}
                  </Button>
                </article>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Snippet code={themeRecipeUsageSnippet(recipeId)} />
              <div className="grid content-start gap-3 text-[13px] text-muted">
                <p className="m-0">The selected recipe is stored as <code className="num text-ink">ledger.theme.recipe</code>. Light and dark mode still use <code className="num text-ink">ledger.theme</code>.</p>
                <p className="m-0">To create another recipe, add a <code className="num text-ink">data-theme-recipe</code> block in <code className="num text-ink">src/theme/recipes.css</code> and add its metadata in <code className="num text-ink">src/theme/recipes.ts</code>.</p>
              </div>
            </div>
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-2">
          <ExampleBlock title="Buttons, menus, overlays">
            <Toolbar
              leading={<Button variant="primary">Primary</Button>}
              trailing={
                <>
                  <Button>Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Delete</Button>
                </>
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu
                label="Actions"
                items={[
                  { id: 'copy', label: 'Copy row', description: 'Use for table actions' },
                  { id: 'archive', label: 'Archive', description: 'Keeps history intact' },
                  { id: 'delete', label: 'Delete', destructive: true },
                ]}
              />
              <Popover trigger="Open popover">
                <div className="grid gap-2">
                  <div className="micro">Popover</div>
                  <p className="m-0 text-[13px] text-muted">Use for compact controls, column settings, and low-risk inline configuration.</p>
                </div>
              </Popover>
              <Tooltip content="Tooltips explain icon-only or compact controls.">
                <Button size="compact">?</Button>
              </Tooltip>
            </div>
          </ExampleBlock>

          <ExampleBlock title="Command palette & dates">
            <div className="flex flex-wrap items-center gap-2">
              <CommandPalette groups={docsCommandGroups} />
              <DateRangePicker
                label="Dates"
                value={docsDateRange}
                onValueChange={setDocsDateRange}
                presets={[
                  { id: 'june', label: 'June 2026', range: { start: '2026-06-01', end: '2026-06-30' } },
                  { id: 'q2', label: 'Q2 2026', range: { start: '2026-04-01', end: '2026-06-30' } },
                ]}
              />
            </div>
            <p className="m-0 text-[13px] text-muted">
              Command result: <code className="num text-ink">{commandResult}</code>
            </p>
          </ExampleBlock>

          <ExampleBlock title="Forms">
            <Field label="Account" required hint="Use labels above controls by default.">
              <Input placeholder="Cobalt Freight" />
            </Field>
            <Field label="Segment">
              <Select defaultValue="enterprise">
                <option value="enterprise">Enterprise</option>
                <option value="midmarket">Mid-market</option>
                <option value="smb">SMB</option>
              </Select>
            </Field>
            <Field label="Notes" error="Keep error copy specific and terse.">
              <Textarea placeholder="Renewal risk, expansion note, or handoff detail" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} label="Include churned accounts" hint="Good for reporting screens." />
              <Switch checked={switchOn} onChange={(event) => setSwitchOn(event.target.checked)} label="Server mode" hint="Use role switch for binary system settings." />
            </div>
          </ExampleBlock>

          <ExampleBlock title="Filters, detail, activity">
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
            <div className="border border-line bg-surface">
              <DetailHeader
                title="Cobalt Freight"
                subtitle="Enterprise account"
                status={<StatusBadge status="Active" />}
                actions={<AssigneeChip name="Avery Cohen" status="online" meta="Owner" />}
              />
              <div className="grid gap-3 p-3">
                <KeyValueList items={accountDetailItems} />
                <DescriptionList items={accountDetailItems.slice(0, 2)} columns={2} />
                <MetadataPanel items={[{ label: 'Created', value: 'June 8, 2026' }, { label: 'Source', value: 'CSV import' }]} />
              </div>
            </div>
            <ActivityFeed title="Recent activity" items={activityItems} />
          </ExampleBlock>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ExampleBlock title="Wizard, import, avatars">
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
          </ExampleBlock>

          <ExampleBlock title="Icon buttons & segmented controls">
            <div className="flex flex-wrap items-center gap-2">
              <IconButton aria-label="Refresh data">↻</IconButton>
              <IconButton aria-label="Filter rows" variant="secondary">⚲</IconButton>
              <IconButton aria-label="More actions" variant="ghost">⋯</IconButton>
              <IconButton aria-label="Delete" variant="destructive">✕</IconButton>
            </div>
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
          </ExampleBlock>

          <ExampleBlock title="Activity timeline">
            <div className="grid gap-3">
              <MetadataPanel title="Import metadata" items={[{ label: 'Batch', value: 'Q3 expansion accounts' }, { label: 'Rows', value: '148' }]} />
              <Timeline items={activityItems} />
            </div>
          </ExampleBlock>

          <ExampleBlock title="Inline alerts & drawer">
            {warnAlertOpen && (
              <InlineAlert tone="warn" title="Two columns are hidden" onDismiss={() => setWarnAlertOpen(false)}>
                Reset the view to show every column again.
              </InlineAlert>
            )}
            <InlineAlert tone="pos">Saved view applied.</InlineAlert>
            <InlineAlert tone="neg" title="Sync failed">Retry the import to continue.</InlineAlert>
            <div>
              <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
            </div>
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
          </ExampleBlock>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ExampleBlock title="Combobox & radio group">
            <Field label="Account owner" hint="Type to filter, then pick from the list.">
              <Combobox options={ownerOptions} value={owner} onValueChange={setOwner} placeholder="Search owners…" />
            </Field>
            <RadioGroup label="Plan" options={planOptions} value={plan} onValueChange={setPlan} />
            <p className="m-0 text-[13px] text-muted">
              Owner: <code className="num text-ink">{owner || '—'}</code> · Plan: <code className="num text-ink">{plan}</code>
            </p>
          </ExampleBlock>

          <ExampleBlock title="Loading states & spinner">
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
          </ExampleBlock>
        </section>

        <section className="grid gap-4">
          <ExampleBlock title="Loading animations">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingKpiSkeleton />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingChartDrawIn />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingDonut />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingBars />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingSparkline />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingDots />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingProgress />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingCountingMetric />
              </div>
              <div className="grid min-h-36 place-items-center border border-line bg-surface p-4">
                <LoadingConcentricArcs />
              </div>
            </div>
          </ExampleBlock>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ExampleBlock title="Tabs, cards, metrics">
            <Tabs
              items={[
                {
                  id: 'overview',
                  label: 'Overview',
                  content: (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Metric label="MRR" value="$84.2k" delta="+4.6%" status="positive" />
                      <Metric label="Recs" value="18" delta="AI priority" status="intelligence" />
                      <Metric label="Review" value="7" delta="needs owner" status="review" />
                    </div>
                  ),
                },
                {
                  id: 'states',
                  label: 'States',
                  content: (
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status="Active" />
                      <StatusBadge status="At risk" />
                      <StatusBadge status="Churned" />
                    </div>
                  ),
                },
              ]}
            />
          </ExampleBlock>

          <ExampleBlock title="Loading, empty, pagination">
            <div className="grid gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <EmptyState
              title="No matching accounts"
              description="Clear filters or create the first account for this saved view."
              action={<Button variant="primary">New account</Button>}
            />
            <Pagination page={page} pageSize={25} total={118} onPageChange={setPage} />
          </ExampleBlock>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card title="App shell recipe">
            <div className="grid gap-4">
              <SectionHeader
                title="Accounts"
                description="Section headers separate content areas inside a routed app shell."
                actions={<Button size="compact">Export</Button>}
              />
              <FilterBar
                actions={<Button size="compact" variant="primary">Apply</Button>}
              >
                <Input className="max-w-xs" placeholder="Search accounts" />
                <Select className="max-w-40" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="risk">At risk</option>
                </Select>
              </FilterBar>
              <Snippet code={stylingSnippet} />
            </div>
          </Card>
          <SettingsPanel title="Settings panel" description="Use for persistent page-level configuration.">
            <Field label="Density">
              <Select defaultValue="standard">
                <option value="compact">Compact</option>
                <option value="standard">Standard</option>
                <option value="comfortable">Comfortable</option>
              </Select>
            </Field>
            <Switch label="Persist view" checked readOnly />
          </SettingsPanel>
        </section>

        <Card title="Theme-safe styling do / avoid">
          <div className="grid gap-3 text-[13px] text-muted sm:grid-cols-2">
            <div className="border border-line bg-surface-2 p-3">
              <div className="micro mb-2">Do</div>
              <p className="m-0">Use tokens and helper classes: <code className="num text-ink">bg-surface</code>, <code className="num text-ink">text-muted</code>, <code className="num text-ink">border-line</code>, <code className="num text-ink">micro</code>, <code className="num text-ink">num</code>.</p>
            </div>
            <div className="border border-line bg-surface-2 p-3">
              <div className="micro mb-2">Avoid</div>
              <p className="m-0">Avoid named color utilities and one-off color values in components. Re-skin by changing <code className="num text-ink">src/theme/tokens.css</code>, not product UI files.</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
