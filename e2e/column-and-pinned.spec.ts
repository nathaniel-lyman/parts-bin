import { expect, test } from '@playwright/test'

test.describe('column virtualization + pinned-column alignment', () => {
  test.fixme('off-screen middle columns are absent from the DOM (needs wide-column fixture)', async ({ page }) => {
    await page.goto('/?rows=10000&cols=wide')
    await expect(page.getByTestId('datagrid-scroll')).toBeVisible()
    await expect(page.getByTestId('col-header-actions')).toBeVisible()
  })
})
