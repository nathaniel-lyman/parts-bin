import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentDetailDrawer } from './ComponentDetailDrawer'
import { CATALOG } from '../catalog'

const get = (name: string) => CATALOG.find((e) => e.name === name)!

test('shows the full reference for an entry', () => {
  render(<ComponentDetailDrawer entry={get('Button')} onClose={() => {}} />)
  const dialog = screen.getByRole('dialog', { name: 'Button' })
  expect(dialog).toHaveTextContent('./components/ui')
  expect(dialog).toHaveTextContent('variant')
  expect(dialog).toHaveTextContent('Use when:')
})

test('renders the interactive demo when one exists', () => {
  render(<ComponentDetailDrawer entry={get('Checkbox')} onClose={() => {}} />)
  expect(screen.getByTestId('drawer-demo')).toBeInTheDocument()
})

test('omits demos that open their own focus-trapped layer', () => {
  render(<ComponentDetailDrawer entry={get('Drawer')} onClose={() => {}} />)
  expect(screen.queryByTestId('drawer-demo')).toBeNull()
})
