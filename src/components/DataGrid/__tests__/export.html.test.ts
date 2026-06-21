import { describe, expect, it } from 'vitest'
import { tsvToHtmlTable } from '../export'

describe('tsvToHtmlTable (rich clipboard flavour)', () => {
  it('renders rows and columns as an HTML table', () => {
    expect(tsvToHtmlTable('Account\tOwner\nAcme\tDana')).toBe(
      '<table><tr><td>Account</td><td>Owner</td></tr><tr><td>Acme</td><td>Dana</td></tr></table>',
    )
  })

  it('escapes HTML-special characters in cells', () => {
    expect(tsvToHtmlTable('a & b\t<x>')).toBe('<table><tr><td>a &amp; b</td><td>&lt;x&gt;</td></tr></table>')
  })

  it('handles a single cell', () => {
    expect(tsvToHtmlTable('Acme')).toBe('<table><tr><td>Acme</td></tr></table>')
  })
})
