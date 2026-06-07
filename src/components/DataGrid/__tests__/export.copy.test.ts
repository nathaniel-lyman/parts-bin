import { describe, expect, it, vi } from 'vitest'
import { copyToClipboard, serializeCell } from '../export'

describe('serializeCell', () => {
  it('stringifies primitives and cleans grid-breaking whitespace', () => {
    expect(serializeCell(900)).toBe('900')
    expect(serializeCell('A\tB\nC')).toBe('A B C')
    expect(serializeCell(null)).toBe('')
  })
})

describe('copyToClipboard', () => {
  it('writes text via the async clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    await copyToClipboard('Acme\t900')
    expect(writeText).toHaveBeenCalledWith('Acme\t900')
  })
})
