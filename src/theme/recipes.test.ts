import { afterEach, expect, test } from 'vitest'
import {
  THEME_RECIPE_STORAGE_KEY,
  applyThemeRecipe,
  installStoredThemeRecipe,
  readStoredThemeRecipe,
} from './recipes'

afterEach(() => {
  document.documentElement.removeAttribute('data-theme-recipe')
  window.localStorage.clear()
})

test('the default recipe clears any document override and persists', () => {
  document.documentElement.dataset.themeRecipe = 'something-else'
  applyThemeRecipe('parts-bin-default')
  expect(document.documentElement.hasAttribute('data-theme-recipe')).toBe(false)
  expect(window.localStorage.getItem(THEME_RECIPE_STORAGE_KEY)).toBe('parts-bin-default')
  expect(readStoredThemeRecipe()).toBe('parts-bin-default')
})

test('installStoredThemeRecipe ignores unknown stored values', () => {
  window.localStorage.setItem(THEME_RECIPE_STORAGE_KEY, 'unknown')
  installStoredThemeRecipe()
  expect(document.documentElement.hasAttribute('data-theme-recipe')).toBe(false)
  expect(readStoredThemeRecipe()).toBe('parts-bin-default')
})

test('falls back to the default for a removed recipe id', () => {
  window.localStorage.setItem(THEME_RECIPE_STORAGE_KEY, 'ops-green')
  expect(readStoredThemeRecipe()).toBe('parts-bin-default')
})

test('maps the legacy ledger default recipe id to parts-bin default', () => {
  window.localStorage.setItem('ledger.theme.recipe', 'ledger-default')
  expect(readStoredThemeRecipe()).toBe('parts-bin-default')
})
