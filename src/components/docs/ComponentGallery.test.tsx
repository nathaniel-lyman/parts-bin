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

test('search filters cards by name and purpose', () => {
  render(<ComponentGallery onSelect={() => {}} />)
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search components' }), {
    target: { value: 'DataGrid' },
  })
  expect(screen.getByRole('button', { name: 'DataGrid' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Banner' })).toBeNull()
})
