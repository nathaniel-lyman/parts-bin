import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FacetedFilter } from './AppliedFilters'

const options = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'startup', label: 'Startup' },
]

describe('FacetedFilter', () => {
  it('closes on Escape and returns focus to the trigger', () => {
    render(
      <FacetedFilter
        label="Segment"
        options={options}
        selectedValues={[]}
        onSelectedValuesChange={vi.fn()}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Segment' })
    fireEvent.click(trigger)
    const search = screen.getByLabelText('Segment filter search')
    search.focus()

    fireEvent.keyDown(search, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('toggles values from the option checkboxes', () => {
    const onChange = vi.fn()
    render(
      <FacetedFilter
        label="Segment"
        options={options}
        selectedValues={['startup']}
        onSelectedValuesChange={onChange}
      />,
    )
    // Accessible name is "Segment1" — adjacent spans concatenate without whitespace.
    fireEvent.click(screen.getByRole('button', { name: /^Segment/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Enterprise/ }))
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(['startup', 'enterprise']))
  })
})
