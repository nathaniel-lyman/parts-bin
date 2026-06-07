import { describe, expect, it } from 'vitest'
import { densityClass } from '../selectors'
import { DENSITIES } from '../types'

describe('densityClass', () => {
  it('maps each density to its helper class', () => {
    expect(densityClass('compact')).toBe('density-compact')
    expect(densityClass('standard')).toBe('density-standard')
    expect(densityClass('comfortable')).toBe('density-comfortable')
  })

  it('covers every density in DENSITIES', () => {
    for (const density of DENSITIES) {
      expect(densityClass(density)).toBe(`density-${density}`)
    }
  })
})

