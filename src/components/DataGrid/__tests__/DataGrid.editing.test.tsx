import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows = seedAccounts.slice(0, 3).map((account, index) => ({
  ...account,
  id: `r${index}`,
  name: `Acct ${index}`,
  owner: `Owner ${index}`,
  segment: 'Startup' as const,
}))

function renderGrid(onRowUpdate = vi.fn()) {
  const utils = render(
    <DataGrid
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      initialState={{ sorting: [] }}
      onRowUpdate={onRowUpdate}
    />,
  )
  return { ...utils, onRowUpdate }
}

function cell(container: HTMLElement, rowId: string, columnId: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`tr[data-row-id="${rowId}"] td[data-column-id="${columnId}"]`)
  if (!el) throw new Error(`cell ${rowId}/${columnId} not found`)
  return el
}

describe('DataGrid inline editing', () => {
  it('double-click opens an editor; Enter commits the patch and marks the cell dirty', async () => {
    const { container, onRowUpdate } = renderGrid()

    await userEvent.dblClick(cell(container, 'r0', 'owner'))
    const input = screen.getByRole('textbox', { name: 'Edit owner' })
    await userEvent.clear(input)
    await userEvent.type(input, 'Dana Field{Enter}')

    expect(onRowUpdate).toHaveBeenCalledTimes(1)
    expect(onRowUpdate).toHaveBeenCalledWith('r0', { owner: 'Dana Field' }, rows[0])
    expect(screen.queryByRole('textbox', { name: 'Edit owner' })).not.toBeInTheDocument()
    expect(cell(container, 'r0', 'owner').dataset.cellDirty).toBe('true')
  })

  it('Escape cancels without committing', async () => {
    const { container, onRowUpdate } = renderGrid()

    await userEvent.dblClick(cell(container, 'r0', 'owner'))
    const input = screen.getByRole('textbox', { name: 'Edit owner' })
    await userEvent.clear(input)
    await userEvent.type(input, 'Nobody{Escape}')

    expect(onRowUpdate).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox', { name: 'Edit owner' })).not.toBeInTheDocument()
    expect(cell(container, 'r0', 'owner').dataset.cellDirty).toBeUndefined()
  })

  it('committing an unchanged value does not call onRowUpdate or mark dirty', async () => {
    const { container, onRowUpdate } = renderGrid()

    await userEvent.dblClick(cell(container, 'r0', 'owner'))
    await userEvent.keyboard('{Enter}')

    expect(onRowUpdate).not.toHaveBeenCalled()
    expect(cell(container, 'r0', 'owner').dataset.cellDirty).toBeUndefined()
  })

  it('validation failure shows an error and blocks the commit', async () => {
    const { container, onRowUpdate } = renderGrid()

    await userEvent.dblClick(cell(container, 'r0', 'mrr'))
    const input = screen.getByRole('spinbutton', { name: 'Edit mrr' })
    await userEvent.clear(input)
    await userEvent.type(input, '-50{Enter}')

    expect(onRowUpdate).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Value cannot be negative')
    // Editor stays open so the value can be fixed.
    expect(screen.getByRole('spinbutton', { name: 'Edit mrr' })).toBeInTheDocument()
  })

  it('Tab commits and moves editing to the next editable cell in the row', async () => {
    const { container, onRowUpdate } = renderGrid()

    await userEvent.dblClick(cell(container, 'r0', 'account'))
    const input = screen.getByRole('textbox', { name: 'Edit account' })
    await userEvent.clear(input)
    await userEvent.type(input, 'Renamed Co{Tab}')

    expect(onRowUpdate).toHaveBeenCalledWith('r0', { name: 'Renamed Co' }, rows[0])
    // Next editable column (owner) is now in edit mode.
    expect(screen.getByRole('textbox', { name: 'Edit owner' })).toBeInTheDocument()
  })

  it('select editor commits enum columns', async () => {
    const { container, onRowUpdate } = renderGrid()

    await userEvent.dblClick(cell(container, 'r0', 'segment'))
    const select = screen.getByRole('combobox', { name: 'Edit segment' })
    await userEvent.selectOptions(select, 'Enterprise')
    await userEvent.keyboard('{Enter}')

    expect(onRowUpdate).toHaveBeenCalledTimes(1)
    const patch = onRowUpdate.mock.calls[0][1] as Record<string, unknown>
    expect(patch.segment).toBe('Enterprise')
  })

  it('does not open editors when onRowUpdate is absent', async () => {
    const { container } = render(
      <DataGrid
        rows={rows}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        initialState={{ sorting: [] }}
      />,
    )
    await userEvent.dblClick(cell(container, 'r0', 'owner'))
    expect(screen.queryByRole('textbox', { name: 'Edit owner' })).not.toBeInTheDocument()
  })
})
