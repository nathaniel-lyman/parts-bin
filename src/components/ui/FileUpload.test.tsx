import { expect, test, vi } from 'vitest'
import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { Dropzone } from './FileUpload'

test('the hidden file input has an accessible name', () => {
  render(<Dropzone label="Drop CSV exports here" onFilesSelected={() => {}} />)
  expect(screen.getByLabelText('Drop CSV exports here')).toHaveAttribute('type', 'file')
})

test('non-string labels fall back to a generic input name', () => {
  render(<Dropzone label={<strong>Drop files</strong>} onFilesSelected={() => {}} />)
  expect(screen.getByLabelText('Choose files')).toHaveAttribute('type', 'file')
})

test('drag highlight survives dragging over children and clears on real leave', () => {
  render(<Dropzone onFilesSelected={() => {}} />)
  const zone = screen.getByText('Drop files here').closest('div.grid.min-h-36') as HTMLElement
  const child = screen.getByText('Drop files here')

  // jsdom drag events drop relatedTarget from the init dict; set it directly
  const dragLeaveTo = (relatedTarget: Element) => {
    const event = createEvent.dragLeave(zone)
    Object.defineProperty(event, 'relatedTarget', { value: relatedTarget })
    fireEvent(zone, event)
  }

  fireEvent.dragEnter(zone)
  expect(zone.className).toContain('bg-surface-2')

  // leaving into a child keeps the highlight
  dragLeaveTo(child)
  expect(zone.className).toContain('bg-surface-2')

  // leaving the zone entirely clears it
  dragLeaveTo(document.body)
  expect(zone.className).not.toContain('bg-surface-2')
})

test('drop forwards the dropped files', () => {
  const onFilesSelected = vi.fn()
  render(<Dropzone onFilesSelected={onFilesSelected} />)
  const zone = screen.getByText('Drop files here').closest('div.grid.min-h-36') as HTMLElement
  const file = new File(['a,b'], 'data.csv', { type: 'text/csv' })

  fireEvent.drop(zone, { dataTransfer: { files: [file] } })
  expect(onFilesSelected).toHaveBeenCalledWith([file])
})
