import { useMemo, useState } from 'react'
import {
  Button,
  Field,
  Input,
  InlineAlert,
  PageHeader,
  RadioGroup,
  Select,
  SegmentedControl,
  Tag,
  WizardLayout,
  type StepItem,
} from '../ui'
import { SettingsPanel } from '../shell'
import {
  THEME_RECIPES,
  applyThemeRecipe,
  readStoredThemeRecipe,
  type ThemeRecipeId,
} from '../../theme/recipes'
import { navigate } from '../../lib/routes'

type StepId = 'use-case' | 'layout' | 'theme' | 'data' | 'generate'
type UseCaseId = 'project-ops' | 'customer-success' | 'review-queue' | 'admin-settings'
type LayoutId = 'metrics-datagrid' | 'settings-workspace'
type DensityChoice = 'standard' | 'compact' | 'comfortable'
type TokenTweak = 'default' | 'compact-radius' | 'risk-forward' | 'quiet-admin'

interface DataMapping {
  entitySingular: string
  entityPlural: string
  routePath: string
  collectionName: string
  primaryField: string
  statusField: string
  ownerField: string
  metricField: string
}

interface ComposerConfig {
  useCaseId: UseCaseId
  layoutId: LayoutId
  recipeId: ThemeRecipeId
  density: DensityChoice
  tokenTweak: TokenTweak
  data: DataMapping
}

interface UseCaseConfig {
  id: UseCaseId
  label: string
  description: string
  defaultLayoutId: LayoutId
  data: DataMapping
  routeVerb: string
}

interface LayoutConfig {
  id: LayoutId
  label: string
  description: string
  templateImport?: 'SettingsPage'
  componentImports: string[]
  previewMode: 'dashboard' | 'workspace' | 'queue' | 'settings'
}

const stepOrder: StepId[] = ['use-case', 'layout', 'theme', 'data', 'generate']

const stepLabels: Record<StepId, { label: string; description: string }> = {
  'use-case': { label: 'Use case', description: 'Admin surface' },
  layout: { label: 'Layout', description: 'Route shell' },
  theme: { label: 'Theme', description: 'Recipe and tokens' },
  data: { label: 'Data', description: 'Domain mapping' },
  generate: { label: 'Generate', description: 'Imports and route' },
}

const useCases: UseCaseConfig[] = [
  {
    id: 'project-ops',
    label: 'Project operations',
    description: 'KPIs, charts, generic records, saved grid views, and row actions.',
    defaultLayoutId: 'metrics-datagrid',
    routeVerb: 'Manage',
    data: {
      entitySingular: 'Project',
      entityPlural: 'Projects',
      routePath: '/projects',
      collectionName: 'projects',
      primaryField: 'title',
      statusField: 'status',
      ownerField: 'owner',
      metricField: 'score',
    },
  },
  {
    id: 'customer-success',
    label: 'Customer success',
    description: 'Portfolio health, priority queue, selected account detail, and touchpoint capture.',
    defaultLayoutId: 'metrics-datagrid',
    routeVerb: 'Renew',
    data: {
      entitySingular: 'Customer',
      entityPlural: 'Customers',
      routePath: '/customers',
      collectionName: 'customers',
      primaryField: 'companyName',
      statusField: 'health',
      ownerField: 'csm',
      metricField: 'renewalValue',
    },
  },
  {
    id: 'review-queue',
    label: 'Review queue',
    description: 'Ranked recommendations, queue filters, decision actions, and audit history.',
    defaultLayoutId: 'metrics-datagrid',
    routeVerb: 'Review',
    data: {
      entitySingular: 'Recommendation',
      entityPlural: 'Recommendations',
      routePath: '/recommendations',
      collectionName: 'recommendations',
      primaryField: 'title',
      statusField: 'decisionStatus',
      ownerField: 'reviewer',
      metricField: 'confidence',
    },
  },
  {
    id: 'admin-settings',
    label: 'Admin settings',
    description: 'Section navigation, staged preferences, permissions, notifications, and appearance.',
    defaultLayoutId: 'settings-workspace',
    routeVerb: 'Configure',
    data: {
      entitySingular: 'User',
      entityPlural: 'Users',
      routePath: '/admin/settings',
      collectionName: 'users',
      primaryField: 'fullName',
      statusField: 'role',
      ownerField: 'team',
      metricField: 'seatCount',
    },
  },
]

const layouts: LayoutConfig[] = [
  {
    id: 'metrics-datagrid',
    label: 'Metrics plus DataGrid',
    description: 'Page header, KPI row, charts, dense table, export, pagination, and row actions.',
    componentImports: ['PageHeader', 'KpiSummaryRow', 'KpiCard', 'DataGrid', 'StatusBadge'],
    previewMode: 'dashboard',
  },
  {
    id: 'settings-workspace',
    label: 'Settings workspace',
    description: 'Section-scroll settings page with panels, staged saves, switches, and theme controls.',
    templateImport: 'SettingsPage',
    componentImports: ['SettingsPage'],
    previewMode: 'settings',
  },
]

const tokenTweaks: Record<TokenTweak, { label: string; description: string; patch: string }> = {
  default: {
    label: 'Recipe only',
    description: 'Use the selected recipe without extra token overrides.',
    patch: `/* src/theme/tokens.css */
/* No extra token overrides needed. */`,
  },
  'compact-radius': {
    label: 'Compact controls',
    description: 'Sharper radii and tighter standard row rhythm.',
    patch: `/* src/theme/tokens.css */
:root {
  --radius: 2px;
  --radius-lg: 4px;
  --row-h-standard: 44px;
  --cell-pad-standard: 4px 10px;
}`,
  },
  'risk-forward': {
    label: 'Risk-forward states',
    description: 'Makes review and reject states more prominent for operational queues.',
    patch: `/* src/theme/tokens.css */
:root {
  --review: var(--warn);
  --review-soft: var(--warn-soft);
  --reject: var(--neg);
  --reject-soft: var(--neg-soft);
}`,
  },
  'quiet-admin': {
    label: 'Quiet admin',
    description: 'Keeps semantics intact while reducing visual competition in settings-heavy apps.',
    patch: `/* src/theme/tokens.css */
:root {
  --accent: var(--ink);
  --accent-soft: var(--surface-2);
  --accent-fg: var(--bg);
}`,
  },
}

const defaultConfig: ComposerConfig = {
  useCaseId: 'project-ops',
  layoutId: 'metrics-datagrid',
  recipeId: 'parts-bin-default',
  density: 'standard',
  tokenTweak: 'default',
  data: useCases[0].data,
}

function findUseCase(id: UseCaseId) {
  return useCases.find((useCase) => useCase.id === id) ?? useCases[0]
}

function findLayout(id: LayoutId) {
  return layouts.find((layout) => layout.id === id) ?? layouts[0]
}

function toWords(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_/-]+/g, ' ')
    .trim()
}

function toPascalCase(value: string, fallback: string) {
  const words = toWords(value || fallback).split(/\s+/).filter(Boolean)
  const next = words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join('')
  return next || fallback
}

function toCamelCase(value: string, fallback: string) {
  const pascal = toPascalCase(value, fallback)
  return `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`
}

function normalizeRoutePath(path: string) {
  const trimmed = path.trim()
  if (!trimmed) return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function makeSteps(currentStepId: StepId): StepItem[] {
  const currentIndex = stepOrder.indexOf(currentStepId)
  return stepOrder.map((id, index) => ({
    id,
    label: stepLabels[id].label,
    description: stepLabels[id].description,
    state: index < currentIndex ? 'complete' : id === currentStepId ? 'current' : 'upcoming',
  }))
}

function updateData(config: ComposerConfig, patch: Partial<DataMapping>): ComposerConfig {
  return { ...config, data: { ...config.data, ...patch } }
}

function isStepValid(config: ComposerConfig, stepId: StepId) {
  if (stepId !== 'data' && stepId !== 'generate') return true
  return Boolean(
    normalizeRoutePath(config.data.routePath) &&
    config.data.entitySingular.trim() &&
    config.data.entityPlural.trim() &&
    config.data.collectionName.trim() &&
    config.data.primaryField.trim(),
  )
}

function importSnippet(layout: LayoutConfig) {
  if (layout.templateImport) {
    return `import { ${layout.templateImport} } from './components/templates'`
  }

  const componentImports = [...layout.componentImports, 'type LedgerGridColumn']
  return `import { ${componentImports.join(', ')} } from './components'`
}

function routeSnippet(config: ComposerConfig, layout: LayoutConfig) {
  const routePath = normalizeRoutePath(config.data.routePath)
  const routeFlag = `${toCamelCase(config.data.entityPlural, 'records')}Active`

  if (layout.templateImport === 'SettingsPage') {
    return `const ${routeFlag} = pathname === '${routePath}'

{${routeFlag} ? (
  <SettingsPage />
) : (
  fallback
)}`
  }

  const componentName = `${toPascalCase(config.data.entityPlural, 'Records')}Route`
  return `const ${routeFlag} = pathname === '${routePath}'

{${routeFlag} ? (
  <${componentName} rows={${toCamelCase(config.data.collectionName, 'records')}} />
) : (
  fallback
)}`
}

function dataSnippet(config: ComposerConfig) {
  const entity = toPascalCase(config.data.entitySingular, 'Record')
  const plural = toCamelCase(config.data.collectionName, 'records')
  const columns = `${toCamelCase(config.data.entitySingular, 'record')}Columns`
  const primaryLabel = toWords(config.data.primaryField) || 'Name'
  const statusLabel = toWords(config.data.statusField) || 'Status'
  const ownerLabel = toWords(config.data.ownerField) || 'Owner'
  const metricLabel = toWords(config.data.metricField) || 'Value'

  return `export interface ${entity}Row {
  id: string
  ${config.data.primaryField}: string
  ${config.data.statusField}: string
  ${config.data.ownerField}: string
  ${config.data.metricField}: number
}

export const ${columns}: LedgerGridColumn<${entity}Row>[] = [
  { id: '${config.data.primaryField}', accessorKey: '${config.data.primaryField}', header: '${primaryLabel}', type: 'text' },
  { id: '${config.data.statusField}', accessorKey: '${config.data.statusField}', header: '${statusLabel}', type: 'status' },
  { id: '${config.data.ownerField}', accessorKey: '${config.data.ownerField}', header: '${ownerLabel}', type: 'text' },
  { id: '${config.data.metricField}', accessorKey: '${config.data.metricField}', header: '${metricLabel}', type: 'number', align: 'right' },
]

export function ${toPascalCase(config.data.entityPlural, 'Records')}Route({ rows }: { rows: ${entity}Row[] }) {
  return (
    <DataGrid
      rows={rows}
      columns={${columns}}
      getRowId={(row) => row.id}
      persistenceKey="parts-bin.${plural}.grid"
      enablePagination
      enableExport
    />
  )
}`
}

function themeSnippet(config: ComposerConfig) {
  return `import { applyThemeRecipe } from './theme/recipes'

applyThemeRecipe('${config.recipeId}')

${tokenTweaks[config.tokenTweak].patch}`
}

function screenSnippet(config: ComposerConfig, layout: LayoutConfig) {
  if (layout.templateImport) {
    return `export function ${toPascalCase(config.data.entityPlural, 'Records')}Route() {
  return <${layout.templateImport} />
}`
  }

  return `export function ${toPascalCase(config.data.entityPlural, 'Records')}Route({ rows }: { rows: ${toPascalCase(config.data.entitySingular, 'Record')}Row[] }) {
  return (
    <main className="w-full px-6 py-6">
      <PageHeader
        title="${config.data.entityPlural}"
        description="${findUseCase(config.useCaseId).routeVerb} ${config.data.entityPlural.toLowerCase()} from one route."
      />
      <KpiSummaryRow>
        <KpiCard label="Open ${config.data.entityPlural.toLowerCase()}" value={String(rows.length)} />
        <KpiCard label="${toWords(config.data.metricField)}" value="$84.2k" />
      </KpiSummaryRow>
      <DataGrid rows={rows} columns={${toCamelCase(config.data.entitySingular, 'record')}Columns} getRowId={(row) => row.id} enablePagination enableExport />
    </main>
  )
}`
}

function Snippet({ title, code }: { title: string; code: string }) {
  return (
    <section className="grid gap-2">
      <div className="micro">{title}</div>
      <pre className="m-0 max-h-[320px] max-w-full overflow-auto border border-line bg-surface-2 p-3 text-[12px] text-ink">
        <code>{code}</code>
      </pre>
    </section>
  )
}

function ChoiceSummary({ config, layout }: { config: ComposerConfig; layout: LayoutConfig }) {
  const useCase = findUseCase(config.useCaseId)
  return (
    <div className="flex flex-wrap gap-2">
      <Tag tone="accent" label={useCase.label} />
      <Tag tone="neutral" label={layout.label} />
      <Tag tone="pos" label={THEME_RECIPES.find((recipe) => recipe.id === config.recipeId)?.name ?? 'Theme'} />
      <Tag tone="warn" label={config.density} />
    </div>
  )
}

function PreviewRows({ config }: { config: ComposerConfig }) {
  const rows = [
    { name: `${config.data.entitySingular} Alpha`, status: 'Active', owner: 'Morgan', value: '$42.8k' },
    { name: `${config.data.entitySingular} Beta`, status: 'Review', owner: 'Avery', value: '$18.4k' },
    { name: `${config.data.entitySingular} Delta`, status: 'Blocked', owner: 'Sam', value: '$9.7k' },
  ]

  return (
    <div className="grid overflow-hidden border border-line">
      <div className="grid grid-cols-[minmax(0,1.5fr)_90px_90px_80px] border-b border-line bg-surface-2 px-3 py-2 text-[12px] text-muted">
        <span>{toWords(config.data.primaryField)}</span>
        <span>{toWords(config.data.statusField)}</span>
        <span>{toWords(config.data.ownerField)}</span>
        <span className="text-right">{toWords(config.data.metricField)}</span>
      </div>
      {rows.map((row) => (
        <div key={row.name} className="grid grid-cols-[minmax(0,1.5fr)_90px_90px_80px] border-b border-line px-3 py-2 text-[12px] last:border-b-0">
          <span className="truncate font-medium text-ink">{row.name}</span>
          <span className="text-muted">{row.status}</span>
          <span className="text-muted">{row.owner}</span>
          <span className="num text-right text-ink">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function LivePreview({ config, layout }: { config: ComposerConfig; layout: LayoutConfig }) {
  return (
    <aside data-theme-preview={config.recipeId} className="grid content-start gap-4 border border-line bg-bg p-4 text-ink">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="micro">Preview</div>
          <h2 className="m-0 text-[18px] font-semibold text-ink">{config.data.entityPlural}</h2>
          <p className="m-0 text-[12px] text-muted">{normalizeRoutePath(config.data.routePath)}</p>
        </div>
        <span className="h-7 w-7 shrink-0 rounded-[2px] border border-line bg-accent" aria-hidden="true" />
      </div>

      {layout.previewMode === 'settings' ? (
        <div className="grid gap-3">
          <SettingsPanel title="Access" description="Roles, teams, and approvals.">
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3 border border-line bg-surface-2 px-3 py-2 text-[13px]">
                <span className="text-ink">Require approval</span>
                <span className="num text-pos">On</span>
              </div>
              <div className="flex items-center justify-between gap-3 border border-line bg-surface-2 px-3 py-2 text-[13px]">
                <span className="text-ink">Seat limit</span>
                <span className="num text-muted">48</span>
              </div>
            </div>
          </SettingsPanel>
        </div>
      ) : layout.previewMode === 'queue' ? (
        <div className="grid gap-3">
          <SegmentedControl
            label="Preview queue status"
            value="pending"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'flagged', label: 'Flagged' },
            ]}
          />
          <div className="grid gap-2">
            {['High confidence match', 'Needs pricing review', 'Blocked by policy'].map((item, index) => (
              <div key={item} className="border border-line bg-surface px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink">{item}</span>
                  <span className="num text-[12px] text-muted">{index + 1}</span>
                </div>
                <p className="m-0 mt-1 text-[12px] text-muted">{config.data.entitySingular} decision routed to {config.data.ownerField}.</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-line bg-surface p-3">
              <div className="micro">Open</div>
              <div className="num mt-2 text-[20px] font-semibold text-ink">128</div>
            </div>
            <div className="border border-line bg-surface p-3">
              <div className="micro">Risk</div>
              <div className="num mt-2 text-[20px] font-semibold text-warn">14</div>
            </div>
            <div className="border border-line bg-surface p-3">
              <div className="micro">Value</div>
              <div className="num mt-2 text-[20px] font-semibold text-pos">$84k</div>
            </div>
          </div>
          <div className="grid h-24 grid-cols-8 items-end gap-1 border border-line bg-surface p-3" aria-label="Preview chart">
            {[42, 58, 46, 64, 72, 69, 82, 78].map((height, index) => (
              <span key={index} className="bg-accent-soft" style={{ height: `${height}%` }} />
            ))}
          </div>
          <PreviewRows config={config} />
        </div>
      )}
    </aside>
  )
}

function UseCaseStep({ config, setConfig }: { config: ComposerConfig; setConfig: (config: ComposerConfig) => void }) {
  return (
    <div className="grid gap-4">
      <RadioGroup
        label="Admin app"
        value={config.useCaseId}
        onValueChange={(value) => {
          const useCase = findUseCase(value as UseCaseId)
          setConfig({
            ...config,
            useCaseId: useCase.id,
            layoutId: useCase.defaultLayoutId,
            data: useCase.data,
          })
        }}
        options={useCases.map((useCase) => ({
          value: useCase.id,
          label: useCase.label,
          description: useCase.description,
        }))}
      />
      <InlineAlert title="Starting point">
        The composer keeps this example route tied to parts-bin barrels, token recipes, and a typed data shape.
      </InlineAlert>
    </div>
  )
}

function LayoutStep({ config, setConfig }: { config: ComposerConfig; setConfig: (config: ComposerConfig) => void }) {
  return (
    <RadioGroup
      label="Layout recipe"
      value={config.layoutId}
      onValueChange={(value) => setConfig({ ...config, layoutId: value as LayoutId })}
      options={layouts.map((layout) => ({
        value: layout.id,
        label: layout.label,
        description: layout.description,
      }))}
    />
  )
}

function ThemeStep({ config, setConfig }: { config: ComposerConfig; setConfig: (config: ComposerConfig) => void }) {
  return (
    <div className="grid gap-5">
      <RadioGroup
        label="Theme recipe"
        value={config.recipeId}
        onValueChange={(value) => {
          const recipeId = value as ThemeRecipeId
          applyThemeRecipe(recipeId)
          setConfig({ ...config, recipeId })
        }}
        options={THEME_RECIPES.map((recipe) => ({
          value: recipe.id,
          label: recipe.name,
          description: recipe.bestFor,
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Density">
          <Select
            value={config.density}
            onChange={(event) => setConfig({ ...config, density: event.target.value as DensityChoice })}
          >
            <option value="standard">Standard</option>
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
          </Select>
        </Field>
        <Field label="Token tweak">
          <Select
            value={config.tokenTweak}
            onChange={(event) => setConfig({ ...config, tokenTweak: event.target.value as TokenTweak })}
          >
            {Object.entries(tokenTweaks).map(([id, tweak]) => (
              <option key={id} value={id}>{tweak.label}</option>
            ))}
          </Select>
        </Field>
      </div>
      <InlineAlert tone="pos" title={tokenTweaks[config.tokenTweak].label}>
        {tokenTweaks[config.tokenTweak].description}
      </InlineAlert>
    </div>
  )
}

function DataStep({ config, setConfig }: { config: ComposerConfig; setConfig: (config: ComposerConfig) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Route path" required>
          <Input
            value={config.data.routePath}
            onChange={(event) => setConfig(updateData(config, { routePath: event.target.value }))}
          />
        </Field>
        <Field label="Collection">
          <Input
            value={config.data.collectionName}
            onChange={(event) => setConfig(updateData(config, { collectionName: event.target.value }))}
          />
        </Field>
        <Field label="Entity singular" required>
          <Input
            value={config.data.entitySingular}
            onChange={(event) => setConfig(updateData(config, { entitySingular: event.target.value }))}
          />
        </Field>
        <Field label="Entity plural" required>
          <Input
            value={config.data.entityPlural}
            onChange={(event) => setConfig(updateData(config, { entityPlural: event.target.value }))}
          />
        </Field>
        <Field label="Primary field" required>
          <Input
            value={config.data.primaryField}
            onChange={(event) => setConfig(updateData(config, { primaryField: event.target.value }))}
          />
        </Field>
        <Field label="Status field">
          <Input
            value={config.data.statusField}
            onChange={(event) => setConfig(updateData(config, { statusField: event.target.value }))}
          />
        </Field>
        <Field label="Owner field">
          <Input
            value={config.data.ownerField}
            onChange={(event) => setConfig(updateData(config, { ownerField: event.target.value }))}
          />
        </Field>
        <Field label="Metric field">
          <Input
            value={config.data.metricField}
            onChange={(event) => setConfig(updateData(config, { metricField: event.target.value }))}
          />
        </Field>
      </div>
    </div>
  )
}

function GenerateStep({ config, layout }: { config: ComposerConfig; layout: LayoutConfig }) {
  return (
    <div className="grid gap-4">
      <ChoiceSummary config={config} layout={layout} />
      <div className="grid gap-4">
        <Snippet title="Component imports" code={importSnippet(layout)} />
        <Snippet title="Route branch" code={routeSnippet(config, layout)} />
        <Snippet title="Screen component" code={screenSnippet(config, layout)} />
        <Snippet title="Data mapping" code={dataSnippet(config)} />
        <Snippet title="Theme setup" code={themeSnippet(config)} />
      </div>
    </div>
  )
}

export function AppComposerPage() {
  const [config, setConfig] = useState<ComposerConfig>(() => ({
    ...defaultConfig,
    recipeId: readStoredThemeRecipe(),
  }))
  const [currentStepId, setCurrentStepId] = useState<StepId>('use-case')
  const currentStepIndex = stepOrder.indexOf(currentStepId)
  const layout = findLayout(config.layoutId)
  const steps = useMemo(() => makeSteps(currentStepId), [currentStepId])
  const nextStep = stepOrder[currentStepIndex + 1]
  const previousStep = stepOrder[currentStepIndex - 1]

  const body = currentStepId === 'use-case'
    ? <UseCaseStep config={config} setConfig={setConfig} />
    : currentStepId === 'layout'
      ? <LayoutStep config={config} setConfig={setConfig} />
      : currentStepId === 'theme'
        ? <ThemeStep config={config} setConfig={setConfig} />
        : currentStepId === 'data'
          ? <DataStep config={config} setConfig={setConfig} />
          : <GenerateStep config={config} layout={layout} />

  return (
    <main className="w-full px-6 py-6">
      <PageHeader
        eyebrow="parts-bin starter"
        title="App composer"
        description="Pick an example admin use case, route layout, theme recipe, and data shape. parts-bin returns template imports, a route branch, a screen shell, and a typed mapping to adapt."
        actions={<Button variant="secondary" onClick={() => { navigate('/docs') }}>Component catalog</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="grid content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
            <div className="grid gap-1">
              <h2 className="micro m-0">Guided build</h2>
              <p className="m-0 text-[12px] text-muted">Each choice updates an example preview and generated template code.</p>
            </div>
            <Button variant="primary" onClick={() => setCurrentStepId('generate')}>Generate screen</Button>
          </div>
          <WizardLayout
            steps={steps}
            currentStepId={currentStepId}
            title={stepLabels[currentStepId].label}
            description={stepLabels[currentStepId].description}
            onStepSelect={(id) => setCurrentStepId(id as StepId)}
            onBack={previousStep ? () => setCurrentStepId(previousStep) : undefined}
            onNext={nextStep ? () => setCurrentStepId(nextStep) : () => setCurrentStepId('use-case')}
            nextLabel={nextStep ? 'Continue' : 'Start over'}
            nextDisabled={!isStepValid(config, currentStepId)}
          >
            {body}
          </WizardLayout>
          <div className="border border-line bg-surface px-4 py-3">
            <ChoiceSummary config={config} layout={layout} />
          </div>
        </section>

        <LivePreview config={config} layout={layout} />
      </div>
    </main>
  )
}
