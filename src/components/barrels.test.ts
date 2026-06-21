import { expect, test } from 'vitest'
import * as charts from './charts'
import * as dataGrid from './DataGrid'
import * as maps from './maps'
import * as components from './index'

test('charts barrel exposes the public chart surface', () => {
  expect(typeof charts.WaterfallChart).toBe('function')
  expect(typeof charts.ChartCard).toBe('function')
  expect(typeof charts.ChartLegend).toBe('function')
  expect(typeof charts.ChartTooltipContent).toBe('function')
  expect(typeof charts.ChartEmptyState).toBe('function')
  expect(typeof charts.SignedMovementChart).toBe('function')
  expect(typeof charts.ShareDonutChart).toBe('function')
  expect(typeof charts.LineTrendChart).toBe('function')
  expect(typeof charts.RevenueMovementChart).toBe('function')
  expect(typeof charts.MrrShareDonut).toBe('function')
  expect(typeof charts.MrrTrendChart).toBe('function')
  expect(typeof charts.buildWaterfallData).toBe('function')
  expect(charts.DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH).toBe(22)
})

test('DataGrid barrel exposes the component, state, query, and helpers', () => {
  expect(typeof dataGrid.DataGrid).toBe('function')
  expect(typeof dataGrid.DataGridToolbar).toBe('function')
  expect(typeof dataGrid.hydrate).toBe('function')
  expect(typeof dataGrid.toGridQuery).toBe('function')
  expect(typeof dataGrid.createMemoryServerAdapter).toBe('function')
  expect(typeof dataGrid.bootGridSeed).toBe('function')
  expect(typeof dataGrid.serializeCSV).toBe('function')
  expect(dataGrid.DEFAULT_STATE).toBeDefined()
  expect('generateAccounts' in dataGrid).toBe(false)
  expect('createMockServerAdapter' in dataGrid).toBe(false)
})

test('maps barrel exposes spatial analytics components and compatibility demo data', () => {
  expect(typeof maps.RegionChoropleth).toBe('function')
  expect(typeof maps.BubbleMap).toBe('function')
  expect(typeof maps.FlowMap).toBe('function')
  expect(typeof maps.GeoDrilldown).toBe('function')
  expect(maps.ledgerRegions.length).toBeGreaterThan(0)
  expect(maps.ledgerPoints.length).toBeGreaterThan(0)
  expect(maps.ledgerFlows.length).toBeGreaterThan(0)
})

test('root barrel aggregates reusable design-system components only', () => {
  expect(typeof components.Button).toBe('function') // ui
  expect(typeof components.IconButton).toBe('function') // new ui primitive
  expect(typeof components.FilterChip).toBe('function')
  expect(typeof components.ActivityFeed).toBe('function')
  expect(typeof components.DetailHeader).toBe('function')
  expect(typeof components.WizardLayout).toBe('function')
  expect(typeof components.Dropzone).toBe('function')
  expect(typeof components.Avatar).toBe('function')
  expect(typeof components.ChartCard).toBe('function')
  expect(typeof components.GeoDrilldown).toBe('function') // maps
  expect(typeof components.DataGrid).toBe('function') // DataGrid
  expect(typeof components.WaterfallChart).toBe('function') // charts
  expect(typeof components.KpiCard).toBe('function') // generic metric display
  expect(typeof components.Sparkline).toBe('function')
  expect(typeof components.ConfirmDialog).toBe('function')
  expect('AccountFormModal' in components).toBe(false)
  expect('accountGridColumns' in components).toBe(false)
})
