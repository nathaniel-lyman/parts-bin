import { expect, test } from '@playwright/test'

// Real-browser coverage for the mouse-drag range copy. jsdom has no real text selection, so the
// unit tests pass even when a drag hijacks the clipboard — these only fail in a real browser.
//   1. Cells set `user-select: none`; if that regresses, the drag creates a native text selection
//      and Cmd/Ctrl+C copies raw page text instead of the grid's structured TSV.
//   2. The copy carries a header row for the copied columns and formats currency/percent values
//      ("$24,600" / "-2.1%") so a paste into Excel keeps the formatting.
test.describe('clipboard range selection', () => {
  async function setup(page: import('@playwright/test').Page) {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/examples/datagrid')
    const grid = page.getByTestId('accounts-grid')
    await expect(grid.getByTestId('col-header-owner')).toBeVisible()
    // Capture what the grid writes to the clipboard (avoids flaky clipboard-permission reads).
    await page.evaluate(() => {
      ;(window as unknown as { __copied: string[] }).__copied = []
      navigator.clipboard.writeText = (text: string) => {
        ;(window as unknown as { __copied: string[] }).__copied.push(text)
        return Promise.resolve()
      }
    })
    return grid
  }

  async function dragRange(
    page: import('@playwright/test').Page,
    grid: import('@playwright/test').Locator,
    startColumnId: string,
    endColumnId: string,
  ) {
    const start = grid.locator(`td[data-row-index="0"][data-column-id="${startColumnId}"]`)
    const end = grid.locator(`td[data-row-index="1"][data-column-id="${endColumnId}"]`)
    await start.scrollIntoViewIfNeeded()
    const [startBox, endBox] = await Promise.all([start.boundingBox(), end.boundingBox()])
    if (!startBox || !endBox) throw new Error('Range cells must be measurable for a drag')
    await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(endBox.x + endBox.width / 2, endBox.y + endBox.height / 2, { steps: 8 })
    await page.mouse.up()
  }

  test('copies a structured, header-prefixed TSV without a native text selection', async ({ page }) => {
    const grid = await setup(page)
    await dragRange(page, grid, 'owner', 'segment')

    // The rectangular range is highlighted...
    await expect(grid.locator('td[aria-selected="true"]')).toHaveCount(4)
    // ...and the drag did NOT create a native text selection (the user-select:none fix).
    expect(await page.evaluate(() => window.getSelection()?.isCollapsed)).toBe(true)

    await page.keyboard.press('ControlOrMeta+c')
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied))
      .toEqual(['Owner\tSegment\nK. Osei\tEnterprise\nK. Osei\tEnterprise'])
  })

  test('copies headers and Excel-friendly formatted currency/percent values', async ({ page }) => {
    const grid = await setup(page)
    await dragRange(page, grid, 'mrr', 'growth')

    await page.keyboard.press('ControlOrMeta+c')
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __copied: string[] }).__copied))
      .toEqual(['Value\tGrowth\n$24,600\t-2.1%\n$18,400\t6.2%'])
  })
})
