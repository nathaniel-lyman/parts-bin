import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGridEmptyState } from '../DataGridEmptyState'
import { DataGridErrorState } from '../DataGridErrorState'
import { DataGridLoadingState } from '../DataGridLoadingState'

describe('runtime-status components', () => {
  it('empty state renders a no-results message', () => {
    render(<DataGridEmptyState />)
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })

  it('empty state shows the active query when given', () => {
    render(<DataGridEmptyState query="acme" />)
    expect(screen.getByText(/acme/)).toBeInTheDocument()
  })

  it('loading state renders a loading indicator', () => {
    render(<DataGridLoadingState />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('error state renders the error message', () => {
    render(<DataGridErrorState error={new Error('fetch failed')} />)
    expect(screen.getByText(/fetch failed/)).toBeInTheDocument()
  })

  it('error state falls back to a generic message for non-Error payloads', () => {
    render(<DataGridErrorState error="boom" />)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})

