import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { WaterfallChart } from './WaterfallChart'

const steps = [
  { label: 'Opening MRR', kind: 'start', value: 100 },
  { label: 'New', kind: 'increase', value: 12 },
  { label: 'Churn', kind: 'decrease', value: 5 },
  { label: 'Closing MRR', kind: 'total' },
] as const

describe('WaterfallChart', () => {
  test('renders visible summary and accessible step narration', () => {
    render(
      <WaterfallChart
        data={steps}
        ariaLabel="MRR bridge"
        valueFormatter={(value) => `$${value.toFixed(1)}k`}
      />,
    )

    expect(screen.getByRole('figure', { name: 'MRR bridge' })).toBeInTheDocument()
    expect(screen.getByText('$100.0k')).toBeInTheDocument()
    expect(screen.getByText('+$7.0k')).toBeInTheDocument()
    expect(screen.getByText('$107.0k')).toBeInTheDocument()
    expect(screen.getByText(/Opening MRR: starting total \$100.0k/)).toBeInTheDocument()
  })
})
