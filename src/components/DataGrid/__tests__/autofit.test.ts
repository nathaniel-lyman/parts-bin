import { afterEach, describe, expect, it, vi } from 'vitest'
import { fitColumnWidth, measureColumnContentWidths } from '../autofit'

describe('fitColumnWidth', () => {
  it('returns the widest content plus padding, rounded up', () => {
    expect(fitColumnWidth([40, 120, 88], { padding: 24 })).toBe(144)
  })

  it('clamps to the minimum when content is narrow', () => {
    expect(fitColumnWidth([10], { padding: 8, min: 48 })).toBe(48)
  })

  it('clamps to the maximum when content is very wide', () => {
    expect(fitColumnWidth([2000], { padding: 24, max: 600 })).toBe(600)
  })

  it('falls back to the minimum when there is no content', () => {
    expect(fitColumnWidth([], { min: 60 })).toBe(60)
  })
})

describe('measureColumnContentWidths', () => {
  const PX_PER_CHAR = 10

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  function stubRects() {
    // jsdom has no layout; approximate every element's width as 10px per character.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const width = (this.textContent ?? '').trim().length * PX_PER_CHAR
      return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
    })
  }

  function buildGrid(headerExtras = '') {
    const scrollEl = document.createElement('div')
    scrollEl.innerHTML = `
      <table>
        <thead><tr>
          <th data-column-id="owner">
            <div>
              <span class="micro" data-autofit-label>Owner</span>
              <span>${headerExtras}</span>
            </div>
          </th>
        </tr></thead>
        <tbody><tr>
          <td data-column-id="owner"><div>A. Rivera</div></td>
        </tr></tbody>
      </table>
    `
    document.body.appendChild(scrollEl)
    return scrollEl
  }

  it('measures header label and cell text', () => {
    stubRects()
    const widths = measureColumnContentWidths(buildGrid(), 'owner')
    expect(widths).toEqual(['Owner'.length * PX_PER_CHAR + 44, 'A. Rivera'.length * PX_PER_CHAR])
  })

  it('ignores the open column menu rendered inside the header cell', () => {
    stubRects()
    const menu = `
      <button>⋮</button>
      <div role="menu">
        <button>Sort ascending</button><button>Sort descending</button><button>Clear sort</button>
        <button>Hide column</button><button>Autofit to content</button><button>Reset width</button>
        <button>Pin left</button><button>Pin right</button>
        <div>Filter (enum)</div><label>Enterprise</label><label>Mid-market</label><label>Startup</label>
      </div>
    `
    const widths = measureColumnContentWidths(buildGrid(menu), 'owner')
    expect(widths[0]).toBe('Owner'.length * PX_PER_CHAR + 44)
  })

  it('skips header cells without a label (filter row)', () => {
    stubRects()
    const scrollEl = buildGrid()
    const filterCell = document.createElement('th')
    filterCell.setAttribute('data-column-id', 'owner')
    filterCell.innerHTML = '<select><option>All</option><option>Enterprise</option><option>Mid-market</option></select>'
    scrollEl.querySelector('thead tr')?.appendChild(filterCell)
    const widths = measureColumnContentWidths(scrollEl, 'owner')
    expect(widths).toEqual(['Owner'.length * PX_PER_CHAR + 44, 'A. Rivera'.length * PX_PER_CHAR])
  })
})
