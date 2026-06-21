import { expect, test } from '@playwright/test'

test.describe('column menu layering', () => {
  test('renders above the accounts totals footer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/examples/datagrid')

    const accountGrid = page.getByTestId('accounts-grid')
    await accountGrid.scrollIntoViewIfNeeded()

    const accountHeader = accountGrid.getByTestId('col-header-account')
    await accountHeader.hover()
    await accountGrid.getByRole('button', { name: 'Account column menu' }).click()

    const menu = page.getByRole('menu', { name: 'Account column menu' })
    const footer = accountGrid.getByTestId('grid-aggregation-footer')
    await expect(menu).toBeVisible()
    await expect(footer).toBeVisible()
    await expect(menu).toHaveClass(/z-50/)

    const result = await page.evaluate(() => {
      const menu = document.querySelector<HTMLElement>('[role="menu"][aria-label="Account column menu"]')
      const footer = document.querySelector<HTMLElement>('[data-testid="accounts-grid"] [data-testid="grid-aggregation-footer"]')
      if (!menu || !footer) return { fixed: false, menuZ: 0, footerZ: 0, portaled: false }

      const menuStyle = getComputedStyle(menu)
      const footerStyle = getComputedStyle(footer)

      return {
        fixed: menuStyle.position === 'fixed',
        menuZ: Number(menuStyle.zIndex),
        footerZ: Number(footerStyle.zIndex),
        portaled: menu.parentElement === document.body,
      }
    })

    expect(result.portaled).toBe(true)
    expect(result.fixed).toBe(true)
    expect(result.menuZ).toBeGreaterThan(result.footerZ)
  })
})
