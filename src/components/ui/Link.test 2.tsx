import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Link } from './Link'

test('renders an anchor with its href', () => {
  render(<Link href="/docs">Component docs</Link>)
  const link = screen.getByRole('link', { name: 'Component docs' })
  expect(link).toHaveAttribute('href', '/docs')
  expect(link).not.toHaveAttribute('target')
})

test('external links open a new tab without leaking the referrer', () => {
  render(<Link href="https://example.com" external>Example</Link>)
  const link = screen.getByRole('link', { name: 'Example' })
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})

test('explicit target/rel props win over the external preset', () => {
  render(<Link href="https://example.com" external target="_self" rel="opener">Example</Link>)
  const link = screen.getByRole('link', { name: 'Example' })
  expect(link).toHaveAttribute('target', '_self')
  expect(link).toHaveAttribute('rel', 'opener')
})
