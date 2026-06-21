import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import { Switch } from './Switch'

test('uses the same corner radius for the track and thumb', () => {
  render(<Switch label="Movement labels" checked readOnly />)

  const control = screen.getByRole('switch', { name: /movement labels/i })
  const track = control.nextElementSibling
  const thumb = track?.nextElementSibling

  expect(track).toHaveClass('rounded-sm')
  expect(thumb).toHaveClass('rounded-sm')
})
