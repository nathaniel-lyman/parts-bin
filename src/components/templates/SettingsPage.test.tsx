import { afterEach, beforeEach, expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../ui'
import { SETTINGS_STORAGE_KEY } from '../../hooks/useSettings'
import { THEME_RECIPE_STORAGE_KEY } from '../../theme/recipes'
import { SettingsPage } from './SettingsPage'

function renderPage() {
  return render(<ToastProvider><SettingsPage /></ToastProvider>)
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  delete document.documentElement.dataset.themeRecipe
  delete document.documentElement.dataset.density
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
  delete document.documentElement.dataset.themeRecipe
  delete document.documentElement.dataset.density
})

test('renders all five settings sections', () => {
  renderPage()
  for (const name of ['Appearance', 'Profile', 'Notifications', 'Preferences', 'Danger zone']) {
    expect(screen.getByRole('heading', { name })).toBeInTheDocument()
  }
})

test('color mode segment toggles the theme live', async () => {
  const user = userEvent.setup()
  renderPage()
  expect(document.documentElement.classList.contains('dark')).toBe(false)
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('selecting a theme recipe applies it live and persists', async () => {
  const user = userEvent.setup()
  renderPage()
  await user.click(screen.getByRole('radio', { name: /finance cobalt/i }))
  expect(document.documentElement.dataset.themeRecipe).toBe('finance-cobalt')
  expect(localStorage.getItem(THEME_RECIPE_STORAGE_KEY)).toBe('finance-cobalt')
})

test('density segment applies a data attribute live', async () => {
  const user = userEvent.setup()
  renderPage()
  const densityGroup = screen.getByRole('radiogroup', { name: 'Density' })
  await user.click(within(densityGroup).getByRole('radio', { name: 'Compact' }))
  expect(document.documentElement.dataset.density).toBe('compact')
})

test('editing a staged field reveals the save bar and persists on save', async () => {
  const user = userEvent.setup()
  renderPage()
  expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()

  const name = screen.getByLabelText('Full name')
  await user.clear(name)
  await user.type(name, 'Devin Okafor')

  const save = screen.getByRole('button', { name: /save changes/i })
  expect(save).toBeInTheDocument()
  await user.click(save)

  expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)!)
  expect(stored.fullName).toBe('Devin Okafor')
})

test('discard reverts staged edits without persisting', async () => {
  const user = userEvent.setup()
  renderPage()
  const name = screen.getByLabelText('Full name')
  await user.clear(name)
  await user.type(name, 'Temporary')
  await user.click(screen.getByRole('button', { name: /discard/i }))
  expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  expect((screen.getByLabelText('Full name') as HTMLInputElement).value).not.toBe('Temporary')
})

test('danger zone opens a confirm dialog', async () => {
  const user = userEvent.setup()
  renderPage()
  await user.click(screen.getByRole('button', { name: /delete workspace/i }))
  expect(screen.getByRole('heading', { name: 'Delete workspace' })).toBeInTheDocument()
})
