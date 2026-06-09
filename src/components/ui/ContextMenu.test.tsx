import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { ContextMenu } from './ContextMenu'

const items = [
  { id: 'edit', label: 'Edit', onSelect: vi.fn() },
  { id: 'duplicate', label: 'Duplicate', onSelect: vi.fn() },
  { id: 'delete', label: 'Delete', destructive: true, onSelect: vi.fn() },
]

function renderTarget() {
  return render(
    <ContextMenu items={items}>
      <div data-testid="target">Row content</div>
    </ContextMenu>,
  )
}

test('right-click opens the menu; selecting an item runs it and closes', () => {
  renderTarget()
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()

  fireEvent.contextMenu(screen.getByTestId('target'))
  expect(screen.getByRole('menu')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
  expect(items[0].onSelect).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('Escape closes the menu', () => {
  renderTarget()
  fireEvent.contextMenu(screen.getByTestId('target'))
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('outside pointerdown closes the menu', () => {
  renderTarget()
  fireEvent.contextMenu(screen.getByTestId('target'))
  fireEvent.pointerDown(document.body)
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('arrow keys move focus between enabled items', () => {
  render(
    <ContextMenu items={[items[0], { id: 'locked', label: 'Locked', disabled: true }, items[2]]}>
      <div data-testid="target">Row content</div>
    </ContextMenu>,
  )
  fireEvent.contextMenu(screen.getByTestId('target'))
  const edit = screen.getByRole('menuitem', { name: 'Edit' })
  edit.focus()
  fireEvent.keyDown(edit, { key: 'ArrowDown' })
  // skips the disabled item
  expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
})

test('opens at the pointer position', () => {
  renderTarget()
  fireEvent.contextMenu(screen.getByTestId('target'), { clientX: 120, clientY: 80 })
  const menu = screen.getByRole('menu')
  expect(menu.style.left).toBe('120px')
  expect(menu.style.top).toBe('80px')
})
