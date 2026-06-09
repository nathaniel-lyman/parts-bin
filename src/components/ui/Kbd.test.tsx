import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Kbd } from './Kbd'

test('renders a semantic <kbd> element with token styling', () => {
  render(<Kbd>⌘K</Kbd>)
  const kbd = screen.getByText('⌘K')
  expect(kbd.tagName).toBe('KBD')
  expect(kbd.className).toContain('border-line')
  expect(kbd.className).toContain('num')
})

test('keys prop renders one <kbd> per key inside a group', () => {
  const { container } = render(<Kbd keys={['Ctrl', 'K']} />)
  const kbds = container.querySelectorAll('kbd')
  expect(kbds).toHaveLength(2)
  expect(kbds[0]).toHaveTextContent('Ctrl')
  expect(kbds[1]).toHaveTextContent('K')
})
