import { expect, test } from '@playwright/test'

test.describe('sticky header', () => {
  test('header stays at the top of the scroller during vertical scroll', async ({ page }) => {
    await page.goto('/?rows=10000')
    const accountGrid = page.getByTestId('accounts-grid')
    const scroller = accountGrid.getByTestId('datagrid-scroll')
    const header = accountGrid.getByTestId('grid-header-row')
    await expect(header).toBeVisible()

    const before = await header.boundingBox()
    await scroller.evaluate((el) => { el.scrollTop = 4000 })
    await expect(header).toBeVisible()
    const after = await header.boundingBox()

    expect(before).not.toBeNull()
    expect(after).not.toBeNull()
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(2)
  })
})
