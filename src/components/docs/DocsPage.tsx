import { useState, type ReactNode } from 'react'
import { Button, Card, PageHeader } from '../ui'
import { SectionHeader } from '../shell'
import {
  THEME_RECIPES,
  applyThemeRecipe,
  readStoredThemeRecipe,
  themeRecipeUsageSnippet,
  type ThemeRecipeId,
} from '../../theme/recipes'
import { CATALOG, CATEGORIES, type Category, type ComponentEntry } from '../catalog'
import { demos } from './demoRegistry'

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

const copyChecklist: Array<[string, string]> = [
  ['Template', 'Start from /templates/customer-success when you want a complete internal app screen instead of isolated primitives.'],
  ['Theme', 'Copy src/theme/ and import theme/theme.css at your root. Re-skin via tokens.css only.'],
  ['Primitives', 'Copy src/components/ui/ and import from the ./ui barrel (Button, Field, Drawer, IconButton, InlineAlert, SegmentedControl, …).'],
  ['Shell', 'Copy src/components/shell/ for the app shell, sidebar, top nav, and filter bars.'],
  ['Charts, maps & DataGrid', 'Copy src/components/charts/, src/components/maps/, and src/components/DataGrid/; import from the ./charts, ./maps, and ./DataGrid barrels.'],
  ['Boundary', 'Copy scripts/lint-theme.mjs and wire npm run lint:theme so raw colors never leak outside src/theme/.'],
]

const CATEGORY_LABELS: Record<Category, string> = {
  primitive: 'UI primitives',
  form: 'Form controls',
  overlay: 'Overlays',
  feedback: 'Feedback & loading',
  'data-display': 'Data display',
  chart: 'Charts',
  datagrid: 'DataGrid',
  map: 'Maps',
  shell: 'Shell',
  starter: 'Starters & templates',
}

function Snippet({ code }: { code: string }) {
  return (
    <pre className="max-w-full min-w-0 overflow-auto border border-line bg-surface-2 p-3 text-[12px] text-ink">
      <code>{code}</code>
    </pre>
  )
}

function ReferenceCard({ entry, demo }: { entry: ComponentEntry; demo?: ReactNode }) {
  return (
    <section className="border border-line rounded-[2px] bg-surface p-4" id={`ref-${entry.name}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="m-0 text-[15px] font-semibold text-ink">{entry.name}</h3>
        <code className="micro text-muted">{entry.import}</code>
      </header>
      <p className="m-0 mt-1 text-[13px] text-ink">{entry.purpose}</p>
      <p className="m-0 mt-1 micro text-muted">Use when: {entry.use_when}</p>
      {entry.prefer_over && (
        <ul className="m-0 mt-1 micro text-muted list-disc pl-4">
          {Object.entries(entry.prefer_over).map(([twin, why]) => (
            <li key={twin}>
              vs <strong className="text-ink">{twin}</strong>: {why}
            </li>
          ))}
        </ul>
      )}
      {entry.related && entry.related.length > 0 && (
        <p className="m-0 mt-1 micro text-muted">related: {entry.related.join(', ')}</p>
      )}
      <p className="m-0 mt-2 micro text-muted">props: {entry.props.join(', ')}</p>
      {entry.variants && (
        <p className="m-0 mt-1 micro text-muted">
          {Object.entries(entry.variants)
            .map(([prop, values]) => `${prop}: ${values.join(' | ')}`)
            .join('   ')}
        </p>
      )}
      <pre className="micro bg-surface-2 border border-line rounded-[2px] p-2 mt-2 overflow-x-auto">
        <code>{entry.snippet}</code>
      </pre>
      {demo && <div className="mt-3 border-t border-line pt-3">{demo}</div>}
    </section>
  )
}

function CatalogReferenceIndex() {
  return (
    <div className="grid gap-6">
      {CATEGORIES.map((cat) => {
        const entries = CATALOG.filter((entry) => entry.category === cat)
        if (entries.length === 0) return null
        return (
          <section key={cat}>
            <SectionHeader
              title={CATEGORY_LABELS[cat] ?? cat}
              description={`${entries.length} ${entries.length === 1 ? 'component' : 'components'}`}
            />
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {entries.map((entry) => (
                <ReferenceCard key={entry.name} entry={entry} demo={demos[entry.name]} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function DocsPage() {
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
        description="Every component is cataloged in src/components/catalog.ts — this page renders that manifest, so coverage is structural. Each card shows the import, when to reach for it, near-twins, real props, and a copy-paste snippet."
        actions={<Button variant="primary" onClick={() => { window.location.href = '/' }}>Open dashboard</Button>}
      />

      <div className="grid gap-6">
        <Card title="Copy Ledger into your app" description="Ledger is a clone-and-customize kit, not an npm package. Copy the theme, primitives, shell, charts, and DataGrid — plus the lint rule — into the app you are building.">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border border-line bg-surface-2 p-3">
              <div className="grid gap-1">
                <h2 className="m-0 text-[15px] font-semibold text-ink">Start with the real app template</h2>
                <p className="m-0 text-[13px] text-muted">Use the customer operations workspace when you need a complete screen: KPIs, queue, grid, detail panel, activity, and a drawer form.</p>
              </div>
              <Button variant="primary" onClick={() => { window.location.href = '/templates/customer-success' }}>Open template</Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Snippet code={usageSnippet} />
              <div className="grid content-start gap-3 text-[13px] text-muted">
                <p className="m-0">Public API: import from the barrels <code className="num text-ink">src/components/ui</code>, <code className="num text-ink">shell</code>, <code className="num text-ink">charts</code>, and <code className="num text-ink">DataGrid</code> — or the aggregate <code className="num text-ink">src/components</code>.</p>
                <p className="m-0">Theme boundary: style with token utilities like <code className="num text-ink">bg-surface</code>, <code className="num text-ink">text-ink</code>, and <code className="num text-ink">border-line</code>.</p>
                <p className="m-0">Reach for the right component: each card below links a near-twin disambiguation so you never reinvent or misuse a primitive.</p>
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

        <Card title="Component reference index" description="One card per cataloged component, grouped by category. Generated from CATALOG so the page can never drift from the kit's real public surface.">
          <CatalogReferenceIndex />
        </Card>

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
