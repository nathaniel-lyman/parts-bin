import { expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BubbleMap, FlowMap, GeoDrilldown, RegionChoropleth, ledgerFlows, ledgerPoints, ledgerRegions, ledgerStatePaths } from './index'

test('default map data uses real US atlas state geometry', () => {
  expect(ledgerStatePaths).toHaveLength(51)
  expect(ledgerStatePaths.find((state) => state.label === 'California')?.path.length).toBeGreaterThan(100)
  expect(ledgerRegions.find((region) => region.id === 'west')?.stateIds).toContain('06')
})

test('RegionChoropleth exposes selectable regions by pointer and keyboard', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()

  render(<RegionChoropleth regions={ledgerRegions} selectedRegionId="west" onRegionSelect={onSelect} />)

  const westButtons = screen.getAllByRole('button', { name: /west/i })
  await user.click(westButtons[0])
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'west' }))

  const southPath = screen.getByRole('button', { name: /south: 34 score/i })
  southPath.focus()
  await user.keyboard('{Enter}')
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'south' }))
})

test('BubbleMap and FlowMap call selection handlers', async () => {
  const user = userEvent.setup()
  const onPoint = vi.fn()
  const onFlow = vi.fn()

  render(
    <div>
      <BubbleMap points={ledgerPoints} regions={ledgerRegions} selectedPointId="seattle" onPointSelect={onPoint} />
      <FlowMap flows={ledgerFlows} regions={ledgerRegions} selectedFlowId="west-midwest" onFlowSelect={onFlow} />
    </div>,
  )

  await user.click(screen.getByRole('button', { name: /san francisco: 32 records/i }))
  expect(onPoint).toHaveBeenCalledWith(expect.objectContaining({ id: 'san-francisco' }))

  await user.click(screen.getByRole('button', { name: /west to midwest: 18 movement/i }))
  expect(onFlow).toHaveBeenCalledWith(expect.objectContaining({ id: 'west-midwest' }))
})

test('GeoDrilldown updates the selected region panel', async () => {
  const user = userEvent.setup()
  const onRegionChange = vi.fn()

  render(<GeoDrilldown regions={ledgerRegions} initialRegionId="west" onRegionChange={onRegionChange} />)

  expect(screen.getByRole('heading', { name: 'West' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /northeast: 25 regional score/i }))

  const panel = screen.getByRole('heading', { name: 'Northeast' }).closest('aside') as HTMLElement
  expect(within(panel).getByText('-1.2%')).toHaveClass('text-neg')
  expect(onRegionChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'northeast' }))
})
