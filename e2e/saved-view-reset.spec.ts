import { expect, test } from '@playwright/test'

test('saved-view reset restores the default grid layout', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  const accountGrid = page.getByTestId('accounts-grid')
  await expect(accountGrid.getByTestId('datagrid-scroll')).toBeVisible()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toHaveCount(0)

  await accountGrid.getByRole('button', { name: 'Columns' }).click()
  await accountGrid.getByRole('checkbox', { name: 'ARR' }).check()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toBeVisible()
  await accountGrid.locator('div.fixed.inset-0.z-10').click()

  await accountGrid.getByRole('button', { name: 'Views' }).click()
  await accountGrid.getByPlaceholder('View name').fill('ARR visible')
  await accountGrid.getByRole('button', { name: 'Save current' }).click()
  await accountGrid.getByRole('button', { name: 'Reset to default' }).click()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toHaveCount(0)

  await accountGrid.getByRole('button', { name: 'Views' }).click()
  await accountGrid.getByRole('button', { name: 'Apply ARR visible' }).click()
  await expect(accountGrid.getByRole('columnheader', { name: /ARR/ })).toBeVisible()
})
