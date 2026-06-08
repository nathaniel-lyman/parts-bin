import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import {
  LoadingBars,
  LoadingChartDrawIn,
  LoadingConcentricArcs,
  LoadingCountingMetric,
  LoadingDonut,
  LoadingDots,
  LoadingKpiSkeleton,
  LoadingProgress,
  LoadingSparkline,
} from './LoadingAnimations'

test('loading animations expose accessible status labels by default', () => {
  render(
    <div>
      <LoadingKpiSkeleton label="Loading KPI card" />
      <LoadingChartDrawIn label="Loading chart line" />
      <LoadingDonut label="Loading share donut" />
      <LoadingBars label="Loading bar chart" />
      <LoadingSparkline label="Loading sparkline metric" />
      <LoadingDots label="Loading dots" />
      <LoadingProgress label="Loading progress" />
      <LoadingCountingMetric label="Loading counted metric" />
      <LoadingConcentricArcs label="Loading arcs" />
    </div>,
  )

  expect(screen.getByRole('status', { name: 'Loading KPI card' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading chart line' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading share donut' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading bar chart' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading sparkline metric' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading dots' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading progress' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading counted metric' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading arcs' })).toBeInTheDocument()
})

test('loading animations can be rendered as decorative UI', () => {
  render(<LoadingDots label="" />)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('progress loader renders its visible detail text', () => {
  render(<LoadingProgress label="Loading rows" detail="Syncing accounts" />)
  expect(screen.getByText('Syncing accounts')).toBeInTheDocument()
})
