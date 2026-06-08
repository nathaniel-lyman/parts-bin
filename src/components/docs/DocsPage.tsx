import { useState, type ReactNode } from 'react'
import {
  Button,
  Card,
  Checkbox,
  DropdownMenu,
  EmptyState,
  Field,
  Input,
  Metric,
  PageHeader,
  Pagination,
  Popover,
  Select,
  Skeleton,
  StatusBadge,
  Switch,
  Tabs,
  Textarea,
  Toolbar,
  Tooltip,
} from '../ui'
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
  ['DropdownMenu', 'Arrow keys skip disabled items; Home/End jump; Enter/Space selects; Escape restores trigger focus.'],
  ['Tabs', 'Arrow keys, Home, and End move the active tab and focus together.'],
  ['Popover', 'Escape closes and returns focus to the trigger.'],
  ['Tooltip', 'Hover and keyboard focus reveal the same content; trigger is described by the tooltip.'],
  ['Field', 'Label, hint, error, required, disabled, and invalid states are wired for single wrapped controls.'],
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
  const [recipeId, setRecipeId] = useState<ThemeRecipeId>(() => readStoredThemeRecipe())

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
        <Card title="Copy this into your app" description="Ledger is currently a clone-and-customize kit, not an npm package. Copy the theme, UI primitives, shell primitives, and the lint rule into the app you are building.">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Snippet code={usageSnippet} />
            <div className="grid content-start gap-3 text-[13px] text-muted">
              <p className="m-0">Public API: import from <code className="num text-ink">src/components/ui</code> and <code className="num text-ink">src/components/shell</code>.</p>
              <p className="m-0">Theme boundary: style with token utilities like <code className="num text-ink">bg-surface</code>, <code className="num text-ink">text-ink</code>, and <code className="num text-ink">border-line</code>.</p>
              <p className="m-0">Packaging story: keep Ledger copy-paste first until the API hardens across two or three real cloned apps.</p>
            </div>
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
