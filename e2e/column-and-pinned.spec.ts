import { expect, test } from '@playwright/test'

test.describe('column virtualization + pinned-column alignment', () => {
  test('off-screen middle columns are absent while the right-pinned actions column stays aligned', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/examples/datagrid?rows=10000&cols=wide')
    const accountGrid = page.getByTestId('accounts-grid')
    const scroller = accountGrid.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()

    await expect(accountGrid.getByTestId('col-header-wide-0')).toBeVisible()
    await expect(accountGrid.getByTestId('col-header-wide-20')).toHaveCount(0)

    const actionsHeader = accountGrid.getByTestId('col-header-actions')
    await expect(actionsHeader).toBeVisible()
    await scroller.evaluate((el) => { el.scrollLeft = el.scrollWidth })
    await expect(accountGrid.getByTestId('col-header-wide-23')).toBeVisible()
    await expect(actionsHeader).toBeVisible()

    const [actionsBox, scrollerBox] = await Promise.all([
      actionsHeader.boundingBox(),
      scroller.boundingBox(),
    ])
    if (!actionsBox || !scrollerBox) throw new Error('Pinned action header and scroller must be measurable')
    expect(Math.abs(actionsBox.x + actionsBox.width - (scrollerBox.x + scrollerBox.width))).toBeLessThan(3)
  })
})
