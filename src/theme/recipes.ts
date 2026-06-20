export type ThemeRecipeId = 'parts-bin-default' | 'finance-cobalt' | 'ops-green' | 'enterprise-neutral'

export interface ThemeRecipe {
  id: ThemeRecipeId
  name: string
  description: string
  bestFor: string
}

export const THEME_RECIPES: ThemeRecipe[] = [
  {
    id: 'parts-bin-default',
    name: 'parts-bin default',
    description: 'Slate surfaces, blue actions, purple intelligence, and explicit review states.',
    bestFor: 'Component libraries, admin tools, review queues, and data-dense workspaces.',
  },
  {
    id: 'finance-cobalt',
    name: 'Finance cobalt',
    description: 'A slightly cooler finance palette that keeps the cobalt interaction model.',
    bestFor: 'Analytical dashboards, forecasting views, and portfolio-style workspaces.',
  },
  {
    id: 'ops-green',
    name: 'Ops green',
    description: 'Operational green accents with calm surfaces and status-forward semantics.',
    bestFor: 'Queues, fulfillment, support, observability, and workflow tools.',
  },
  {
    id: 'enterprise-neutral',
    name: 'Enterprise neutral',
    description: 'Quiet monochrome chrome with color reserved almost entirely for data meaning.',
    bestFor: 'Admin consoles, governance screens, and conservative internal systems.',
  },
]

export const THEME_RECIPE_STORAGE_KEY = 'parts-bin.theme.recipe'
const LEGACY_PARTS_KIT_THEME_RECIPE_STORAGE_KEY = 'parts-kit.theme.recipe'
const LEGACY_THEME_RECIPE_STORAGE_KEY = 'ledger.theme.recipe'
const LEGACY_DEFAULT_RECIPE_ID = 'ledger-default'
const DEFAULT_RECIPE_ID: ThemeRecipeId = 'parts-bin-default'

const ids = new Set<ThemeRecipeId>(THEME_RECIPES.map((recipe) => recipe.id))

export function isThemeRecipeId(value: string | null | undefined): value is ThemeRecipeId {
  return ids.has(value as ThemeRecipeId)
}

export function readStoredThemeRecipe(): ThemeRecipeId {
  if (typeof window === 'undefined') return DEFAULT_RECIPE_ID
  const stored = window.localStorage.getItem(THEME_RECIPE_STORAGE_KEY)
    ?? window.localStorage.getItem(LEGACY_PARTS_KIT_THEME_RECIPE_STORAGE_KEY)
    ?? window.localStorage.getItem(LEGACY_THEME_RECIPE_STORAGE_KEY)
  if (stored === LEGACY_DEFAULT_RECIPE_ID) return DEFAULT_RECIPE_ID
  return isThemeRecipeId(stored) ? stored : DEFAULT_RECIPE_ID
}

export function applyThemeRecipe(recipeId: ThemeRecipeId) {
  if (typeof document === 'undefined') return

  if (recipeId === DEFAULT_RECIPE_ID) {
    document.documentElement.removeAttribute('data-theme-recipe')
  } else {
    document.documentElement.dataset.themeRecipe = recipeId
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_RECIPE_STORAGE_KEY, recipeId)
  }
}

export function installStoredThemeRecipe() {
  applyThemeRecipe(readStoredThemeRecipe())
}

export function themeRecipeUsageSnippet(recipeId: ThemeRecipeId) {
  return `import { applyThemeRecipe } from './theme/recipes'

applyThemeRecipe('${recipeId}')

// Or set it directly before React renders:
document.documentElement.dataset.themeRecipe = '${recipeId}'`
}
