import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataGridBulkActions } from '../DataGridBulkActions'

describe('DataGridBulkActions', () => {
  it('renders nothing when count is 0', () => {
    const { container } = render(<DataGridBulkActions count={0} onClear={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the selected count and clears selection', async () => {
    const onClear = vi.fn()
    render(<DataGridBulkActions count={3} onClear={onClear} />)
    expect(screen.getByText('3 selected')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /clear selection/i }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
