import { expect, test } from '@playwright/test'

test.describe('reorder + keyboard nav', () => {
  test('shows a whole-column drag preview before committing column order', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/examples/dashboard')

    const accountGrid = page.getByTestId('accounts-grid')
    const accountHeader = accountGrid.getByTestId('col-header-account')
    const ownerHeader = accountGrid.getByTestId('col-header-owner')
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

    const activeCellOpacity = await accountGrid.locator('td[data-column-id="account"]').first().evaluate((element) => getComputedStyle(element).opacity)
    const ownerCellTransform = await accountGrid.locator('td[data-column-id="owner"]').first().evaluate((element) => getComputedStyle(element).transform)
    expect(Number(activeCellOpacity)).toBeLessThan(0.6)
    expect(ownerCellTransform).not.toBe('none')

    await page.mouse.up()
    await expect(overlay).toHaveCount(0)

    const headerOrder = await accountGrid.locator('th[data-column-id]').evaluateAll((headers) => headers.map((header) => header.getAttribute('data-column-id')))
    expect(headerOrder.slice(0, 2)).toEqual(['owner', 'account'])
  })

  test('keyboard nav scrolls a far-down virtualized cell into view', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/examples/dashboard?rows=10000')
    const accountGrid = page.getByTestId('accounts-grid')
    const scroller = accountGrid.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()

    const firstCell = accountGrid.getByTestId('grid-row-row-0').locator('[role="gridcell"]').first()
    await firstCell.focus()
    for (let index = 0; index < 20; index += 1) await page.keyboard.press('PageDown')

    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
    await expect(focused).toHaveAttribute('role', 'gridcell')

    const rowIndex = Number(await focused.getAttribute('data-row-index'))
    expect(rowIndex).toBeGreaterThan(100)
    await expect(accountGrid.getByTestId(`grid-row-row-${rowIndex}`)).toBeVisible()

    const [cellBox, scrollerBox] = await Promise.all([
      focused.boundingBox(),
      scroller.boundingBox(),
    ])
    if (!cellBox || !scrollerBox) throw new Error('Focused cell and scroller must be measurable')
    expect(cellBox.y).toBeGreaterThanOrEqual(scrollerBox.y)
    expect(cellBox.y + cellBox.height).toBeLessThanOrEqual(scrollerBox.y + scrollerBox.height + 1)
  })
})
