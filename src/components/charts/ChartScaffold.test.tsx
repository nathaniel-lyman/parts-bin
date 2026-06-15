import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChartCard, ChartLegend } from './ChartScaffold'

describe('ChartScaffold', () => {
  it('renders an insight title, caveat description, metric, and actions', () => {
    render(
      <ChartCard
        title="Enterprise drove the $25k MRR lift"
        description="Demo history; values are in $k."
        metric="+$25k"
        actions={<button type="button">Labels</button>}
      >
        <div>chart body</div>
      </ChartCard>,
    )

    expect(screen.getByRole('heading', { name: 'Enterprise drove the $25k MRR lift' })).toBeInTheDocument()
    expect(screen.getByText('Demo history; values are in $k.')).toBeInTheDocument()
    expect(screen.getByText('+$25k')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Labels' })).toBeInTheDocument()
    expect(screen.getByText('chart body')).toBeInTheDocument()
  })

  it('supports theme palette swatches for visible chart labels', () => {
    render(
      <ChartLegend
        items={[
          { id: 'enterprise', label: 'Enterprise', color: 'var(--accent)', value: '$58,750 (75%)' },
        ]}
      />,
    )

    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('$58,750 (75%)')).toBeInTheDocument()
  })
})
