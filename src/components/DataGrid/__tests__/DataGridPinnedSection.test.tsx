import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGridPinnedSection } from '../DataGridPinnedSection'

describe('DataGridPinnedSection', () => {
  it('applies sticky left positioning + shadow divider for a left group', () => {
    const { container } = render(<table><tbody><tr><DataGridPinnedSection side="left"><td>Account</td></DataGridPinnedSection></tr></tbody></table>)
    const wrap = container.querySelector('[data-pinned="left"]') as HTMLElement
    expect(wrap.className).toContain('sticky')
    expect(wrap.className).toContain('left-0')
    expect(wrap.className).toContain('shadow-pinned')
  })

  it('applies sticky right positioning for a right group', () => {
    const { container } = render(<table><tbody><tr><DataGridPinnedSection side="right"><td>Actions</td></DataGridPinnedSection></tr></tbody></table>)
    const wrap = container.querySelector('[data-pinned="right"]') as HTMLElement
    expect(wrap.className).toContain('sticky')
    expect(wrap.className).toContain('right-0')
    expect(wrap.className).toContain('shadow-pinned')
  })

  it('renders no sticky wrapper class for center', () => {
    const { container } = render(<table><tbody><tr><DataGridPinnedSection side="center"><td>Owner</td></DataGridPinnedSection></tr></tbody></table>)
    const wrap = container.querySelector('[data-pinned="center"]') as HTMLElement
    expect(wrap.className).not.toContain('sticky')
    expect(wrap.className).not.toContain('shadow-pinned')
  })
})

