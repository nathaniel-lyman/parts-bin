import { expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppComposerPage } from './AppComposerPage'

test('generates default imports, route branch, data mapping, and theme setup', () => {
  render(<AppComposerPage />)

  expect(screen.getByText(/parts-bin starter/i)).toBeInTheDocument()
  expect(screen.getByText(/generated template code/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Generate screen' }))

  expect(screen.getByText('Component imports')).toBeInTheDocument()
  expect(screen.getByText(/import \{ PageHeader, KpiSummaryRow, KpiCard, DataGrid, StatusBadge/)).toBeInTheDocument()
  expect(screen.getByText(/const projectsActive = pathname === '\/projects'/)).toBeInTheDocument()
  expect(screen.getByText(/export interface ProjectRow/)).toBeInTheDocument()
  expect(screen.getByText(/persistenceKey="parts-bin.projects.grid"/)).toBeInTheDocument()
  expect(screen.getByText(/applyThemeRecipe\('ledger-default'\)/)).toBeInTheDocument()
})

test('switches use case defaults to the review queue template', () => {
  render(<AppComposerPage />)

  fireEvent.click(screen.getByRole('radio', { name: /Review queue/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Generate screen' }))

  expect(screen.getByText(/import \{ RecommendationReviewTemplate \}/)).toBeInTheDocument()
  expect(screen.getByText(/const recommendationsActive = pathname === '\/recommendations'/)).toBeInTheDocument()
  expect(screen.getAllByText(/<RecommendationReviewTemplate/).length).toBeGreaterThan(0)
  expect(screen.getByText(/decisionStatus/)).toBeInTheDocument()
})

test('data mapping edits update generated identifiers', async () => {
  render(<AppComposerPage />)

  fireEvent.click(screen.getByRole('button', { name: /Data.*Domain mapping/ }))
  fireEvent.change(await screen.findByLabelText(/Route path/), { target: { value: '/projects' } })
  fireEvent.change(screen.getByLabelText(/Entity singular/), { target: { value: 'Project' } })
  fireEvent.change(screen.getByLabelText(/Entity plural/), { target: { value: 'Projects' } })
  fireEvent.change(screen.getByLabelText('Collection'), { target: { value: 'projects' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

  expect(screen.getByText(/const projectsActive = pathname === '\/projects'/)).toBeInTheDocument()
  expect(screen.getAllByText(/export function ProjectsRoute/).length).toBeGreaterThan(0)
  expect(screen.getByText(/persistenceKey="parts-bin.projects.grid"/)).toBeInTheDocument()
})
