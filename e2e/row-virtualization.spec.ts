import { expect, test } from '@playwright/test'

test.describe('row virtualization', () => {
  test('keeps the mounted row count bounded for 10k rows', async ({ page }) => {
    await page.goto('/?rows=10000')
    const scroller = page.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()

    const mountedRows = await page.locator('[data-testid^="grid-row-"]').count()
    expect(mountedRows).toBeGreaterThan(0)
    expect(mountedRows).toBeLessThan(80)
    await expect(page.getByTestId('grid-row-row-0')).toBeVisible()
    await expect(page.getByTestId('grid-row-row-9999')).toHaveCount(0)
  })

  test('scrolling to the bottom swaps the mounted row window', async ({ page }) => {
    await page.goto('/?rows=10000')
    const scroller = page.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()

    await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight })
    await expect(page.getByTestId('grid-row-row-9999')).toBeVisible()
    await expect(page.getByTestId('grid-row-row-0')).toHaveCount(0)
  })
})
