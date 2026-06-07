import { expect, test } from '@playwright/test'

test('saved-view reset restores the default grid layout', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByTestId('datagrid-scroll')).toBeVisible()
  await expect(page.getByRole('columnheader', { name: /ARR/ })).toHaveCount(0)

  await page.getByRole('button', { name: 'Columns' }).click()
  await page.getByRole('checkbox', { name: 'ARR' }).check()
  await expect(page.getByRole('columnheader', { name: /ARR/ })).toBeVisible()
  await page.locator('div.fixed.inset-0.z-10').click()

  await page.getByRole('button', { name: 'Views' }).click()
  await page.getByPlaceholder('View name').fill('ARR visible')
  await page.getByRole('button', { name: 'Save current' }).click()
  await page.getByRole('button', { name: 'Reset to default' }).click()
  await expect(page.getByRole('columnheader', { name: /ARR/ })).toHaveCount(0)

  await page.getByRole('button', { name: 'Views' }).click()
  await page.getByRole('button', { name: 'Apply ARR visible' }).click()
  await expect(page.getByRole('columnheader', { name: /ARR/ })).toBeVisible()
})
