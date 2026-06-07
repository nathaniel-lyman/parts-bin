import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { Sparkline } from './Sparkline'

test('renders a polyline with one point per datum', () => {
  const { container } = render(<Sparkline data={[1, 2, 3, 4]} />)
  const poly = container.querySelector('polyline')
  expect(poly).not.toBeNull()
  expect(poly!.getAttribute('points')!.trim().split(' ')).toHaveLength(4)
})

test('uses the accent token by default and neg token when neg', () => {
  const { container: a } = render(<Sparkline data={[1, 2]} />)
  expect(a.querySelector('polyline')!.getAttribute('stroke')).toBe('var(--accent)')
  const { container: n } = render(<Sparkline data={[1, 2]} neg />)
  expect(n.querySelector('polyline')!.getAttribute('stroke')).toBe('var(--neg)')
})

test('renders nothing for fewer than two points', () => {
  const { container } = render(<Sparkline data={[5]} />)
  expect(container.querySelector('polyline')).toBeNull()
})
