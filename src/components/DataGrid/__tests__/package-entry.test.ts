import { describe, expect, it } from 'vitest'
import * as dataGrid from '../index'

describe('DataGrid package entrypoint', () => {
  it('imports the neutral grid surface without account demo fixtures', () => {
    expect(typeof dataGrid.DataGrid).toBe('function')
    expect(typeof dataGrid.createMemoryServerAdapter).toBe('function')
    expect(typeof dataGrid.bootGridSeed).toBe('function')
    expect(typeof dataGrid.savedViewsKeyForGrid).toBe('function')
    expect(typeof dataGrid.DataGridToolbar).toBe('function')
    expect(typeof dataGrid.serializeCSV).toBe('function')
    expect(dataGrid.DEFAULT_STATE.columnOrder).toEqual([])
    expect(dataGrid.DEFAULT_STATE.columnVisibility).toEqual({})
    expect('generateAccounts' in dataGrid).toBe(false)
    expect('createMockServerAdapter' in dataGrid).toBe(false)
    expect('accountGlobalFilter' in dataGrid).toBe(false)
    expect('accountGridColumns' in dataGrid).toBe(false)
  })
})
