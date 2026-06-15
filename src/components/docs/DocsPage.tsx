import { useState } from 'react'
import { Button, Card, PageHeader } from '../ui'
import {
  THEME_RECIPES,
  applyThemeRecipe,
  readStoredThemeRecipe,
  themeRecipeUsageSnippet,
  type ThemeRecipeId,
} from '../../theme/recipes'
import { navigate } from '../../lib/routes'
import type { ComponentEntry } from '../catalog'
import { ComponentGallery } from './ComponentGallery'
import { ComponentDetailDrawer } from './ComponentDetailDrawer'

const usageSnippet = `import { Button, Card, Field, Input } from './components/ui'
import { AppShell, Sidebar, TopNav } from './components/shell'

export function SampleAccountsScreen() {
  return (
    <Card title="Account details">
      <Field label="Name" required>
        <Input placeholder="Cobalt Freight" />
      </Field>
    </Card>
  )
}`

const copyChecklist: Array<[string, string]> = [
  ['Composer', 'Open /compose to select an admin use case, layout, theme recipe, and data mapping before copying code.'],
  ['Template', 'Start from /templates/customer-success or /templates/recommendation-review when you want a complete internal app screen instead of isolated primitives.'],
  ['Theme', 'Copy src/theme/ and import theme/theme.css at your root. Re-skin via tokens.css only.'],
  ['Primitives', 'Copy src/components/ui/ and import from the ./ui barrel (Button, Field, Drawer, IconButton, InlineAlert, SegmentedControl, …).'],
  ['Shell', 'Copy src/components/shell/ for the app shell, sidebar, top nav, and filter bars.'],
  ['Charts', 'Copy src/components/charts/ for token-styled Recharts wrappers and ChartCard examples; import from the ./charts barrel.'],
  ['Maps & DataGrid', 'Copy src/components/maps/ and src/components/DataGrid/ for geographic views and the headless-table-backed grid.'],
  ['Boundary', 'Copy scripts/lint-theme.mjs and wire npm run lint:theme so raw colors never leak outside src/theme/.'],
]

function Snippet({ code }: { code: string }) {
  return (
    <pre className="max-w-full min-w-0 overflow-auto border border-line bg-surface-2 p-3 text-[12px] text-ink">
      <code>{code}</code>
    </pre>
  )
}

export function DocsPage({ globalSearch = '' }: { globalSearch?: string }) {
  const [recipeId, setRecipeId] = useState<ThemeRecipeId>(() => readStoredThemeRecipe())
  const [selected, setSelected] = useState<ComponentEntry | null>(null)

  const selectRecipe = (nextRecipeId: ThemeRecipeId) => {
    setRecipeId(nextRecipeId)
    applyThemeRecipe(nextRecipeId)
  }

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-6">
      <PageHeader
        eyebrow="parts-bin component kit"
        title="Components and sample dashboard"
        description="parts-bin is a working dashboard that demonstrates the components cataloged in src/components/catalog.ts. Click any card for import, props, near-twins, and a copy-paste snippet."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => { navigate('/compose') }}>Open composer</Button>
            <Button variant="secondary" onClick={() => { navigate('/') }}>Open sample dashboard</Button>
          </div>
        }
      />

      <div className="grid gap-6">
        <Card title="Component gallery" description="Every cataloged component, visually. Click a card for the full reference, props, snippet, and live demo.">
          <ComponentGallery onSelect={setSelected} externalQuery={globalSearch} />
        </Card>

        <Card title="Copy parts-bin into your app" description="parts-bin is a clone-and-customize component kit, not an npm package. The dashboard is only a sample assembly; copy the theme, primitives, shell, charts, and DataGrid into the app you are building.">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border border-line bg-surface-2 p-3">
              <div className="grid gap-1">
                <h2 className="m-0 text-[15px] font-semibold text-ink">Start with a real app template</h2>
                <p className="m-0 text-[13px] text-muted">Use the composer for a routed screen plan, or jump straight into a clone-ready workflow surface.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => { navigate('/compose') }}>App composer</Button>
                <Button variant="secondary" onClick={() => { navigate('/templates/customer-success') }}>Customer success</Button>
                <Button variant="secondary" onClick={() => { navigate('/templates/recommendation-review') }}>Recommendation review</Button>
              </div>
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
                <p className="m-0">The selected recipe is stored as <code className="num text-ink">parts-bin.theme.recipe</code>. Light and dark mode use <code className="num text-ink">parts-bin.theme</code>; old <code className="num text-ink">parts-kit.*</code> and <code className="num text-ink">ledger.*</code> keys are read for migration.</p>
                <p className="m-0">To create another recipe, add a <code className="num text-ink">data-theme-recipe</code> block in <code className="num text-ink">src/theme/recipes.css</code> and add its metadata in <code className="num text-ink">src/theme/recipes.ts</code>.</p>
              </div>
            </div>
          </div>
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

      {selected && <ComponentDetailDrawer entry={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}
