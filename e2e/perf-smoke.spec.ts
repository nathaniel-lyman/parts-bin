import { expect, test } from '@playwright/test'

test.describe('10k row performance smoke', () => {
  test('keeps DOM rows bounded while preserving grid counts and keyboard resize affordance', async ({ page }) => {
    await page.goto('/?rows=10000')
    const scroller = page.getByTestId('datagrid-scroll')
    await expect(scroller).toBeVisible()
    await expect(page.getByRole('grid')).toHaveAttribute('aria-rowcount', '10000')

    const mountedRows = await page.locator('[data-testid^="grid-row-"]').count()
    expect(mountedRows).toBeGreaterThan(0)
    expect(mountedRows).toBeLessThan(80)

    const resizeHandle = page.getByRole('separator', { name: /Resize MRR column/ })
    await resizeHandle.focus()
    await page.keyboard.press('Control+ArrowRight')
    await expect(resizeHandle).toBeFocused()
  })
})
