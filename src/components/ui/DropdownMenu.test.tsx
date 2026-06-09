import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'

const flushRaf = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))

// Items built inline so every render produces fresh references — the common call-site shape.
const makeItems = (): DropdownMenuItem[] => [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

describe('DropdownMenu', () => {
  it('focuses the first enabled item when opened', async () => {
    render(<DropdownMenu label="Menu" items={makeItems()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    await flushRaf()
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus()
  })

  it('does not snap focus back to the first item when the parent re-renders while open', async () => {
    const { rerender } = render(<DropdownMenu label="Menu" items={makeItems()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    await flushRaf()

    const alpha = screen.getByRole('menuitem', { name: 'Alpha' })
    fireEvent.keyDown(alpha, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: 'Beta' })).toHaveFocus()

    // Parent re-render with fresh item references must not re-trigger the open-focus effect.
    rerender(<DropdownMenu label="Menu" items={makeItems()} />)
    await flushRaf()
    expect(screen.getByRole('menuitem', { name: 'Beta' })).toHaveFocus()
  })
})
