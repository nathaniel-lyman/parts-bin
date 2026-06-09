import { describe, expect, it } from 'vitest'
import { rowHeightForDensity } from '../selectors'

describe('rowHeightForDensity', () => {
  it('matches the --row-h token for each density', () => {
    expect(rowHeightForDensity('compact')).toBe(40)
    expect(rowHeightForDensity('standard')).toBe(48)
    expect(rowHeightForDensity('comfortable')).toBe(56)
  })
})
