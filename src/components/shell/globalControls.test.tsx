import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CalendarIconButton,
  FilterButton,
  GlobalSearchInput,
  NotificationBadge,
  NotificationButton,
  TimePeriodSelector,
  UserAvatarMenu,
} from './index'

test('global controls expose independent accessible surfaces', async () => {
  const onPeriodChange = vi.fn()
  const onCalendar = vi.fn()
  const onFilter = vi.fn()
  const onNotify = vi.fn()
  const onProfile = vi.fn()

  render(
    <div>
      <GlobalSearchInput aria-label="Global search" />
      <TimePeriodSelector
        value="90d"
        options={[
          { value: '30d', label: 'Last 30 days' },
          { value: '90d', label: 'Last 90 days' },
        ]}
        onChange={onPeriodChange}
      />
      <CalendarIconButton label="Open calendar" onClick={onCalendar} />
      <FilterButton label="Risks" pressed onClick={onFilter} />
      <NotificationButton count={3} onClick={onNotify} />
      <UserAvatarMenu
        name="Morgan"
        initials="MO"
        items={[{ id: 'profile', label: 'Profile', onSelect: onProfile }]}
      />
      <span className="relative inline-flex">
        <NotificationBadge count={12} />
      </span>
    </div>,
  )

  await userEvent.selectOptions(screen.getByLabelText('Time period'), '30d')
  await userEvent.click(screen.getByRole('button', { name: /open calendar/i }))
  await userEvent.click(screen.getByRole('button', { name: /risks/i }))
  await userEvent.click(screen.getByRole('button', { name: /3 notifications/i }))
  await userEvent.click(screen.getByRole('button', { name: /morgan/i }))
  await userEvent.click(screen.getByRole('menuitem', { name: /profile/i }))

  expect(screen.getByRole('searchbox', { name: /global search/i })).toBeInTheDocument()
  expect(onPeriodChange).toHaveBeenCalledWith('30d')
  expect(onCalendar).toHaveBeenCalledTimes(1)
  expect(onFilter).toHaveBeenCalledTimes(1)
  expect(onNotify).toHaveBeenCalledTimes(1)
  expect(onProfile).toHaveBeenCalledTimes(1)
  expect(screen.getByText('9+')).toBeInTheDocument()
})
