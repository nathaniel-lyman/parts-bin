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
  applyThemeRecipe('ledger-default')
  expect(document.documentElement.hasAttribute('data-theme-recipe')).toBe(false)
  expect(window.localStorage.getItem(THEME_RECIPE_STORAGE_KEY)).toBe('ledger-default')
})

test('installStoredThemeRecipe ignores unknown stored values', () => {
  window.localStorage.setItem(THEME_RECIPE_STORAGE_KEY, 'unknown')
  installStoredThemeRecipe()
  expect(document.documentElement.hasAttribute('data-theme-recipe')).toBe(false)
  expect(readStoredThemeRecipe()).toBe('ledger-default')
})
