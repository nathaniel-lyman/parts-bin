import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ComponentGallery } from './ComponentGallery'
import { CATALOG } from '../catalog'

test('renders one card per cataloged component', () => {
  render(<ComponentGallery onSelect={() => {}} />)
  for (const entry of CATALOG) {
    expect(screen.getByRole('button', { name: entry.name }), entry.name).toBeInTheDocument()
  }
})

test('clicking a card selects its catalog entry', () => {
  const onSelect = vi.fn()
  render(<ComponentGallery onSelect={onSelect} />)
  fireEvent.click(screen.getByRole('button', { name: 'Button' }))
  expect(onSelect).toHaveBeenCalledWith(CATALOG.find((e) => e.name === 'Button'))
})

test('search filters cards by name, purpose, and catalog metadata', () => {
  render(<ComponentGallery onSelect={() => {}} />)
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search components' }), {
    target: { value: 'DataGrid' },
  })
  expect(screen.getByRole('button', { name: 'DataGrid' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Banner' })).toBeNull()

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search components' }), {
    target: { value: 'enableGlobalShortcuts' },
  })
  expect(screen.getByRole('button', { name: 'CommandPalette' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'DataGrid' })).toBeNull()
})

test('external query participates in metadata search and empty states explain recovery', () => {
  const { rerender } = render(<ComponentGallery onSelect={() => {}} externalQuery="keyboard-key" />)
  expect(screen.getByRole('button', { name: 'Kbd' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Button' })).toBeNull()

  rerender(<ComponentGallery onSelect={() => {}} externalQuery="definitely-not-a-ledger-component" />)
  expect(screen.getByRole('heading', { name: 'No matching components' })).toBeInTheDocument()
  expect(screen.getByText(/Try clearing the shell search/)).toBeInTheDocument()
})
