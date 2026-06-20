import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedAccounts } from '../../data/accounts'
import { MrrShareDonut, ShareDonutChart } from './MrrShareDonut'

describe('MrrShareDonut', () => {
  it('renders generic share rows with a caller-provided total label and formatter', () => {
    render(
      <ShareDonutChart
        data={[
          { id: 'open', label: 'Open', value: 30 },
          { id: 'review', label: 'Review', value: 10 },
        ]}
        totalLabel="Rows"
        valueFormatter={(value) => `${value} rows`}
      />,
    )

    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('30 rows (75%)')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('10 rows (25%)')).toBeInTheDocument()
    expect(screen.getByText('Rows')).toBeInTheDocument()
  })

  it('renders visible segment labels with values and share percentages', () => {
    render(<MrrShareDonut accounts={seedAccounts} />)

    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('$58,750 (75%)')).toBeInTheDocument()
    expect(screen.getByText('Mid-market')).toBeInTheDocument()
    expect(screen.getByText('$16,000 (20%)')).toBeInTheDocument()
    expect(screen.getByText('Startup')).toBeInTheDocument()
    expect(screen.getByText('$3,550 (5%)')).toBeInTheDocument()
  })
})
