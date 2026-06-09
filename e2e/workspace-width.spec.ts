import { expect, test } from '@playwright/test'

const workspaceRoutes = [
  '/',
  '/templates/customer-success',
  '/templates/recommendation-review',
]

test.describe('workspace width', () => {
  for (const route of workspaceRoutes) {
    test(`${route} fills the shell content column on wide screens`, async ({ page }) => {
      await page.setViewportSize({ width: 2048, height: 1200 })
      await page.goto(route)
      await expect(page.locator('main')).toBeVisible()

      const metrics = await page.evaluate(() => {
        const main = document.querySelector('main')
        const shellContent = main?.parentElement
        const mainRect = main?.getBoundingClientRect()
        const shellRect = shellContent?.getBoundingClientRect()
        return {
          mainWidth: Math.round(mainRect?.width ?? 0),
          shellWidth: Math.round(shellRect?.width ?? 0),
          rightGap: Math.round((shellRect?.right ?? 0) - (mainRect?.right ?? 0)),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }
      })

      expect(metrics.mainWidth).toBe(metrics.shellWidth)
      expect(metrics.rightGap).toBe(0)
      expect(metrics.scrollWidth).toBe(metrics.clientWidth)
    })
  }

  test('recommendation detail metrics stay inside the fixed detail rail', async ({ page }) => {
    await page.setViewportSize({ width: 1470, height: 622 })
    await page.goto('/templates/recommendation-review')
    const metrics = page.getByTestId('recommendation-detail-metrics')
    await expect(metrics).toBeVisible()

    const overflowingCells = await metrics.evaluate((grid) => Array.from(grid.children)
      .filter((cell) => cell.scrollWidth > cell.clientWidth + 1)
      .map((cell) => cell.textContent?.replace(/\s+/g, ' ').trim()))

    expect(overflowingCells).toEqual([])
  })
})
