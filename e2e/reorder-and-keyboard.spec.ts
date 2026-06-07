import { expect, test } from '@playwright/test'

test.describe('reorder + keyboard nav', () => {
  test.fixme('keyboard nav scrolls a far-down virtualized cell into view (needs roving focus)', async ({ page }) => {
    await page.goto('/?rows=10000')
    const scroller = page.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()
  })
})
