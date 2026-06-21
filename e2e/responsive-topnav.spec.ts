import { expect, test } from '@playwright/test'

// TopNav must stay one compact row at every common viewport — secondary
// controls collapse behind breakpoints instead of wrapping into stacked rows.
const widths = [390, 768, 1024, 1280, 1440]

test.describe('responsive top nav', () => {
  for (const width of widths) {
    test(`stays a single compact row at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/examples/dashboard')
      const topNav = page.locator('header').first()
      await expect(topNav).toBeVisible()

      const box = await topNav.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeLessThanOrEqual(64)

      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflowX).toBe(0)
    })
  }

  test('keeps essentials reachable at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/examples/dashboard')
    await expect(page.getByRole('button', { name: /command/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /notifications/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^(dark|light)$/i })).toBeVisible()
    await expect(page.getByLabel('Global search')).toBeHidden()
  })

  test('shows the full control set at wide width', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 })
    await page.goto('/examples/dashboard')
    await expect(page.getByLabel('Global search')).toBeVisible()
    await expect(page.getByLabel('Time period')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Review' })).toBeVisible()
  })
})
