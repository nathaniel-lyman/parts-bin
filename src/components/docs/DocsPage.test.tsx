import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DocsPage } from './DocsPage'
import { CATALOG } from '../catalog'
import { demos } from './demoRegistry'

test('renders a reference card for every cataloged component', () => {
  render(<DocsPage />)
  for (const entry of CATALOG) {
    expect(document.getElementById(`ref-${entry.name}`), entry.name).not.toBeNull()
  }
})

test('mounts without throwing', () => {
  expect(() => render(<DocsPage />)).not.toThrow()
})

test('every demo key is a cataloged component name', () => {
  const names = new Set(CATALOG.map((entry) => entry.name))
  const orphanDemos = Object.keys(demos).filter((key) => !names.has(key))
  expect(orphanDemos).toEqual([])
})

test('still renders the copy-into-your-app and reference index sections', () => {
  render(<DocsPage />)
  expect(screen.getByRole('heading', { name: 'Copy Ledger into your app' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Start with the real app template' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Component reference index' })).toBeInTheDocument()
})

test('each reference card shows its import path and props', () => {
  render(<DocsPage />)
  const button = document.getElementById('ref-Button') as HTMLElement
  expect(button).not.toBeNull()
  expect(button).toHaveTextContent('./components/ui')
  expect(button).toHaveTextContent('variant')
})
