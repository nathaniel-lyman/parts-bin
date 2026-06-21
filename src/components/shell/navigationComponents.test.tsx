import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ActiveNavigationItem,
  AdminNavigationItem,
  AdminSectionDivider,
  BrandLockup,
  CollapseSidebarControl,
  LeftNavigationDrawer,
  NavigationItem,
  Sidebar,
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

test('sidebar resizing is off by default and opt-in on the public wrapper', () => {
  const { rerender } = render(
    <Sidebar
      brand="Parts"
      items={[{ label: 'Overview', href: '/', active: true }]}
    />,
  )

  expect(screen.queryByRole('separator', { name: /resize sidebar/i })).not.toBeInTheDocument()

  rerender(
    <Sidebar
      brand="Parts"
      items={[{ label: 'Overview', href: '/', active: true }]}
      resizable
    />,
  )

  expect(screen.getByRole('separator', { name: /resize sidebar/i })).toBeInTheDocument()
})

test('resizable navigation drawer updates width with pointer drag', () => {
  const onWidthChange = vi.fn()
  const { container } = render(
    <LeftNavigationDrawer
      brand="Parts"
      items={[{ label: 'Overview', href: '/', active: true }]}
      resizable={{ defaultWidth: 240, minWidth: 200, maxWidth: 300, onWidthChange }}
    />,
  )

  const drawer = container.querySelector('aside')
  const handle = screen.getByRole('separator', { name: /resize sidebar/i })
  expect(drawer).toHaveStyle({ width: '240px' })

  fireEvent.pointerDown(handle, { clientX: 100, button: 0 })
  expect(document.body.style.cursor).toBe('col-resize')
  expect(document.body.style.userSelect).toBe('none')

  fireEvent.pointerMove(window, { clientX: 180 })
  expect(onWidthChange).toHaveBeenLastCalledWith(300)
  expect(drawer).toHaveStyle({ width: '300px' })

  fireEvent.pointerUp(window)
  expect(document.body.style.cursor).toBe('')
  expect(document.body.style.userSelect).toBe('')
})

test('resizable navigation drawer supports keyboard width changes', () => {
  const onWidthChange = vi.fn()
  const { container } = render(
    <LeftNavigationDrawer
      brand="Parts"
      items={[{ label: 'Overview', href: '/', active: true }]}
      resizable={{ defaultWidth: 220, minWidth: 200, maxWidth: 240, onWidthChange }}
    />,
  )

  const drawer = container.querySelector('aside')
  const handle = screen.getByRole('separator', { name: /resize sidebar/i })

  fireEvent.keyDown(handle, { key: 'ArrowRight' })
  expect(onWidthChange).toHaveBeenLastCalledWith(236)
  expect(drawer).toHaveStyle({ width: '236px' })

  fireEvent.keyDown(handle, { key: 'Home' })
  expect(onWidthChange).toHaveBeenLastCalledWith(200)
  expect(drawer).toHaveStyle({ width: '200px' })

  fireEvent.keyDown(handle, { key: 'End' })
  expect(onWidthChange).toHaveBeenLastCalledWith(240)
  expect(drawer).toHaveStyle({ width: '240px' })
})
