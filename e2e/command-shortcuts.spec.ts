import { expect, test } from '@playwright/test'

test.describe('command shortcuts', () => {
  test('run workspace, grid, and assistant commands without opening the palette', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await page.keyboard.press('t')
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.keyboard.press('r')
    await expect(page.getByText(/At-risk focus/)).toBeVisible()

    await page.keyboard.press('v')
    await page.keyboard.press('s')
    await expect(page.getByText('Saved view Risk focus')).toBeVisible()

    await page.getByRole('checkbox', { name: 'Select Cobalt Freight' }).click()
    await expect(page.getByText('1 selected')).toBeVisible()
    await page.keyboard.press('v')
    await page.keyboard.press('c')
    await expect(page.getByText('Cleared 1 selected row')).toBeVisible()
    await expect(page.getByText('1 selected')).toHaveCount(0)

    await page.keyboard.press('s')
    await expect(page.getByRole('dialog', { name: 'Assistant' })).toBeVisible()
    await expect(page.getByText(/You are on/)).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toHaveCount(0)
  })

  test('ignore text-entry focus but still work from checkbox focus', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await page.getByLabel('Global search').fill('r')
    await page.keyboard.press('r')
    await expect(page.getByText(/At-risk focus/)).toHaveCount(0)

    await page.getByLabel('Global search').clear()
    await page.getByRole('checkbox', { name: 'Select Cobalt Freight' }).focus()
    await page.keyboard.press('r')
    await expect(page.getByText(/At-risk focus/)).toBeVisible()
  })

  test('movement shortcut opens evidence-backed assistant answer', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await page.keyboard.press('m')

    await expect(page.getByRole('dialog', { name: 'Assistant' })).toBeVisible()
    await expect(page.getByText(/Revenue movement is net positive/)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Evidence used')).toBeVisible()
    await expect(page.getByText(/Chart: Revenue movement \(\$k\), 10 monthly rows/)).toBeVisible()
    await expect(page.getByText(/Separation: chart evidence uses dashboard monthly movement data/)).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toHaveCount(0)
  })
})
