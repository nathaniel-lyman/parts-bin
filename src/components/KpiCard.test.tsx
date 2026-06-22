import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard, KpiSummaryRow } from './KpiCard'

test('renders label, value, and delta magnitude', () => {
  render(<KpiCard label="Total value" value="$78,300" delta={4.6} />)
  expect(screen.getByText('Total value')).toBeInTheDocument()
  expect(screen.getByText('$78,300')).toBeInTheDocument()
  expect(screen.getByText('4.6%')).toBeInTheDocument()
})

test('KpiSummaryRow composes KPI cards', () => {
  render(
    <KpiSummaryRow>
      <KpiCard label="Active accounts" value="12" />
    </KpiSummaryRow>,
  )
  expect(screen.getByText('Active accounts')).toBeInTheDocument()
})
