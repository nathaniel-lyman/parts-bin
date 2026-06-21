import { expect, test } from '@playwright/test'

test('saved-view reset restores the default grid layout', async ({ page }) => {
  await page.goto('/examples/datagrid')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  const accountGrid = page.getByTestId('accounts-grid')
  await expect(accountGrid.getByTestId('datagrid-scroll')).toBeVisible()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toHaveCount(0)

  await accountGrid.getByRole('button', { name: 'Columns' }).click()
  await accountGrid.getByRole('checkbox', { name: 'ARR' }).check()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toBeVisible()
  // Dismiss the Columns dropdown by clicking its backdrop above the grid header.
  // On this harness route the grid sits near the top of the page, so the sticky
  // header (z-20) covers the scrim's (z-10) center — click higher, over the page
  // header, where only the scrim is hit-testable.
  await accountGrid.locator('div.fixed.inset-0.z-10').click({ position: { x: 640, y: 120 } })

  await accountGrid.getByRole('button', { name: 'Views' }).click()
  await accountGrid.getByPlaceholder('View name').fill('ARR visible')
  await accountGrid.getByRole('button', { name: 'Save current' }).click()
  await accountGrid.getByRole('button', { name: 'Reset to default' }).click()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toBeVisible()

  await accountGrid.getByRole('button', { name: 'Views' }).click()
  await accountGrid.getByRole('button', { name: 'Apply ARR visible' }).click()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toBeVisible()
})
