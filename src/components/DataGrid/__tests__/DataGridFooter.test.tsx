import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DataGridFooter } from '../DataGridFooter'

function setup(overrides: Partial<ComponentProps<typeof DataGridFooter>> = {}) {
  const onPageIndexChange = vi.fn()
  const onPageSizeChange = vi.fn()
  render(
    <DataGridFooter
      pageIndex={1}
      pageSize={25}
      pageCount={4}
      totalRowCount={87}
      onPageIndexChange={onPageIndexChange}
      onPageSizeChange={onPageSizeChange}
      {...overrides}
    />,
  )
  return { onPageIndexChange, onPageSizeChange }
}

describe('DataGridFooter', () => {
  it('shows a one-based page indicator', () => {
    setup()
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument()
  })

  it('pages forward and backward', async () => {
    const { onPageIndexChange } = setup()
    await userEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageIndexChange).toHaveBeenCalledWith(2)

    await userEvent.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onPageIndexChange).toHaveBeenCalledWith(0)
  })

  it('changes page size', async () => {
    const { onPageSizeChange } = setup()
    await userEvent.selectOptions(screen.getByLabelText(/rows per page/i), '50')
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })
})
