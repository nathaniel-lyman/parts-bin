import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ActiveNavigationItem,
  AdminNavigationItem,
  AdminSectionDivider,
  BrandLockup,
  CollapseSidebarControl,
  LeftNavigationDrawer,
  NavigationItem,
} from './index'

test('navigation building blocks render accessible standalone pieces', async () => {
  const onCollapsedChange = vi.fn()
  render(
    <LeftNavigationDrawer
      brand="Ledger"
      brandMark="#"
      items={[
        { label: 'Overview', href: '/', active: true },
        { label: 'Reports', href: '/reports', meta: '4' },
      ]}
      adminItems={[{ label: 'Settings', href: '/settings' }]}
      footer="demo"
      collapsed={false}
      onCollapsedChange={onCollapsedChange}
    />,
  )

  expect(screen.getByRole('link', { name: /ledger/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /overview/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText('Admin')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }))
  expect(onCollapsedChange).toHaveBeenCalledWith(true)
})

test('individual navigation exports can be composed directly', () => {
  render(
    <nav>
      <BrandLockup>Ledger</BrandLockup>
      <NavigationItem label="Reports" href="/reports" />
      <ActiveNavigationItem label="Accounts" href="/accounts" />
      <AdminSectionDivider />
      <AdminNavigationItem label="Users" href="/users" />
      <CollapseSidebarControl collapsed />
    </nav>,
  )

  expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /accounts/i })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
})
