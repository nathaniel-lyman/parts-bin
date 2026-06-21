import { describe, expect, it } from 'vitest'
import { formatDataGridNumber, resolveNumberFormat } from '../numberFormat'

describe('DataGrid number formatting', () => {
  it('preserves the grid defaults for currency and percent columns', () => {
    expect(formatDataGridNumber(900, 'currency')).toBe('$900')
    expect(formatDataGridNumber(5, 'percent')).toBe('5.0%')
  })

  it('applies notation, fraction, sign, and grouping overrides', () => {
    expect(formatDataGridNumber(12345.678, 'number', undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
      signDisplay: 'always',
      useGrouping: false,
    })).toBe('+12.3K')
  })

  it('lets percent columns render raw values when the scale is overridden', () => {
    expect(formatDataGridNumber(0.125, 'percent', undefined, { scale: 1, maximumFractionDigits: 1 })).toBe('12.5%')
  })

  it('merges column defaults with state overrides', () => {
    expect(resolveNumberFormat('currency', { currency: 'EUR' }, { maximumFractionDigits: 2 })).toMatchObject({
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    })
  })
})
