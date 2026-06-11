import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

test('Spinner exposes a status role with an accessible label by default', () => {
  render(<Spinner label="Loading accounts" />)
  expect(screen.getByRole('status', { name: 'Loading accounts' })).toBeInTheDocument()
})

test('Spinner is decorative (no status role) when label is empty', () => {
  render(<Spinner label="" />)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
