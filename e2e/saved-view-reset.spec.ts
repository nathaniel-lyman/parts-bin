import { expect, test } from '@playwright/test'

test.fixme('saved-view reset restores the default grid layout (needs saved views)', async ({ page }) => {
  await page.goto('/?rows=10000')
  await expect(page.getByTestId('datagrid-scroll')).toBeVisible()
})
