import { expect, test } from '@playwright/test'

// Routes whose <main> is meant to fill the shell content column. The docs page
// is intentionally reading-width capped (mx-auto max-w-[1180px]), so it is not
// included here.
const workspaceRoutes = [
  '/examples/dashboard',
  '/examples/datagrid',
  '/settings',
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

})
