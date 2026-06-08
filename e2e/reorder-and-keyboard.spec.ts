import { expect, test } from '@playwright/test'

test.describe('reorder + keyboard nav', () => {
  test('shows a whole-column drag preview before committing column order', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')

    const accountHeader = page.getByTestId('col-header-account')
    const ownerHeader = page.getByTestId('col-header-owner')
    await expect(accountHeader).toBeVisible()
    await expect(ownerHeader).toBeVisible()
    await accountHeader.scrollIntoViewIfNeeded()

    const accountBox = await accountHeader.boundingBox()
    const ownerBox = await ownerHeader.boundingBox()
    if (!accountBox || !ownerBox) throw new Error('Column headers must be measurable for drag preview')

    await page.mouse.move(accountBox.x + 18, accountBox.y + accountBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(accountBox.x + 34, accountBox.y + accountBox.height / 2, { steps: 4 })
    await page.mouse.move(ownerBox.x + 18, ownerBox.y + ownerBox.height / 2, { steps: 12 })

    const overlay = page.getByTestId('column-drag-overlay')
    await expect(overlay).toBeVisible()
    await expect(overlay).toHaveAttribute('data-column-id', 'account')

    const activeCellOpacity = await page.locator('td[data-column-id="account"]').first().evaluate((element) => getComputedStyle(element).opacity)
    const ownerCellTransform = await page.locator('td[data-column-id="owner"]').first().evaluate((element) => getComputedStyle(element).transform)
    expect(Number(activeCellOpacity)).toBeLessThan(0.6)
    expect(ownerCellTransform).not.toBe('none')

    await page.mouse.up()
    await expect(overlay).toHaveCount(0)

    const headerOrder = await page.locator('th[data-column-id]').evaluateAll((headers) => headers.map((header) => header.getAttribute('data-column-id')))
    expect(headerOrder.slice(0, 2)).toEqual(['owner', 'account'])
  })

  test.fixme('keyboard nav scrolls a far-down virtualized cell into view (needs roving focus)', async ({ page }) => {
    await page.goto('/?rows=10000')
    const scroller = page.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()
  })
})
