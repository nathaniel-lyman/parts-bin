import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

test('renders label, value, and delta glyph', () => {
  render(<KpiCard label="Total MRR" value="$78,300" delta={4.6} />)
  expect(screen.getByText('Total MRR')).toBeInTheDocument()
  expect(screen.getByText('$78,300')).toBeInTheDocument()
  expect(screen.getByText(/▲ 4.6%/)).toBeInTheDocument()
})
