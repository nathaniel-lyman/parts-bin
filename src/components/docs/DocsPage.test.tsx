import { expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DocsPage } from './DocsPage'
import { CATALOG } from '../catalog'
import { demos } from './demoRegistry'

test('renders a gallery card for every cataloged component', () => {
  render(<DocsPage />)
  for (const entry of CATALOG) {
    expect(screen.getByRole('button', { name: entry.name }), entry.name).toBeInTheDocument()
  }
})

test('clicking a card opens the detail drawer with the reference', () => {
  render(<DocsPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Button' }))
  const dialog = screen.getByRole('dialog', { name: 'Button' })
  expect(dialog).toHaveTextContent('variant')
  expect(dialog).toHaveTextContent('./components/ui')
})

test('every demo key is a cataloged component name', () => {
  const names = new Set(CATALOG.map((entry) => entry.name))
  const orphanDemos = Object.keys(demos).filter((key) => !names.has(key))
  expect(orphanDemos).toEqual([])
})

test('keeps the onboarding and theme sections below the gallery', () => {
  render(<DocsPage />)
  expect(screen.getByRole('button', { name: 'Browse components' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Use parts-bin in your app' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Examples are secondary' })).toBeInTheDocument()
  expect(screen.getByText(/Use \/, \/compose, and \/templates\/\*/)).toBeInTheDocument()
})
