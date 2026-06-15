import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { seedAccounts } from '../../data/accounts'
import { MrrShareDonut } from './MrrShareDonut'

describe('MrrShareDonut', () => {
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
