import { expect, test } from 'vitest'
import * as charts from './charts'
import * as dataGrid from './DataGrid'
import * as components from './index'

test('charts barrel exposes the public chart surface', () => {
  expect(typeof charts.WaterfallChart).toBe('function')
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
  expect(typeof dataGrid.generateAccounts).toBe('function')
  expect(typeof dataGrid.serializeCSV).toBe('function')
  expect(dataGrid.DEFAULT_STATE).toBeDefined()
})

test('root barrel aggregates ui, shell, charts, DataGrid, and dashboard components', () => {
  expect(typeof components.Button).toBe('function') // ui
  expect(typeof components.IconButton).toBe('function') // new ui primitive
  expect(typeof components.DataGrid).toBe('function') // DataGrid
  expect(typeof components.WaterfallChart).toBe('function') // charts
  expect(typeof components.KpiCard).toBe('function') // dashboard
  expect(typeof components.Sparkline).toBe('function')
  expect(typeof components.ConfirmDialog).toBe('function')
  expect(typeof components.AccountFormModal).toBe('function')
  expect(typeof components.accountGridColumns).toBe('function')
})
