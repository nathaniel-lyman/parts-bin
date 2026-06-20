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

test('applies and stores a theme recipe', () => {
  applyThemeRecipe('ops-green')
  expect(document.documentElement.dataset.themeRecipe).toBe('ops-green')
  expect(window.localStorage.getItem(THEME_RECIPE_STORAGE_KEY)).toBe('ops-green')
  expect(readStoredThemeRecipe()).toBe('ops-green')
})

test('default recipe clears the document override', () => {
  applyThemeRecipe('enterprise-neutral')
  applyThemeRecipe('parts-bin-default')
  expect(document.documentElement.hasAttribute('data-theme-recipe')).toBe(false)
  expect(window.localStorage.getItem(THEME_RECIPE_STORAGE_KEY)).toBe('parts-bin-default')
})

test('installStoredThemeRecipe ignores unknown stored values', () => {
  window.localStorage.setItem(THEME_RECIPE_STORAGE_KEY, 'unknown')
  installStoredThemeRecipe()
  expect(document.documentElement.hasAttribute('data-theme-recipe')).toBe(false)
  expect(readStoredThemeRecipe()).toBe('parts-bin-default')
})

test('reads the legacy ledger recipe key during migration', () => {
  window.localStorage.setItem('ledger.theme.recipe', 'ops-green')
  expect(readStoredThemeRecipe()).toBe('ops-green')
})

test('maps the legacy ledger default recipe id to parts-bin default', () => {
  window.localStorage.setItem('ledger.theme.recipe', 'ledger-default')
  expect(readStoredThemeRecipe()).toBe('parts-bin-default')
})

test('reads the previous parts-kit recipe key during migration', () => {
  window.localStorage.setItem('parts-kit.theme.recipe', 'ops-green')
  expect(readStoredThemeRecipe()).toBe('ops-green')
})
