import { beforeEach, expect, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, useSettings } from './useSettings'

beforeEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.density
  delete document.documentElement.dataset.reduceMotion
})

test('defaults to comfortable density with no data attribute', () => {
  const { result } = renderHook(() => useSettings())
  expect(result.current.settings.density).toBe('comfortable')
  expect(document.documentElement.dataset.density).toBeUndefined()
})

test('update persists a partial patch merged over defaults', () => {
  const { result } = renderHook(() => useSettings())
  act(() => result.current.update({ density: 'compact', emailDigest: false }))

  expect(result.current.settings.density).toBe('compact')
  expect(result.current.settings.emailDigest).toBe(false)
  // Untouched fields keep their defaults.
  expect(result.current.settings.fullName).toBe(DEFAULT_SETTINGS.fullName)

  const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)!)
  expect(stored.density).toBe('compact')
  expect(document.documentElement.dataset.density).toBe('compact')
})

test('reduceMotion sets a data attribute on the root', () => {
  const { result } = renderHook(() => useSettings())
  act(() => result.current.update({ reduceMotion: true }))
  expect(document.documentElement.dataset.reduceMotion).toBe('true')
  act(() => result.current.update({ reduceMotion: false }))
  expect(document.documentElement.dataset.reduceMotion).toBeUndefined()
})

test('rehydrates persisted settings on init, merging over defaults', () => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ density: 'compact', fullName: 'Devin' }))
  const { result } = renderHook(() => useSettings())
  expect(result.current.settings.density).toBe('compact')
  expect(result.current.settings.fullName).toBe('Devin')
  // A field absent from the stored payload falls back to the default.
  expect(result.current.settings.numberFormat).toBe(DEFAULT_SETTINGS.numberFormat)
  expect(document.documentElement.dataset.density).toBe('compact')
})

test('reset restores defaults', () => {
  const { result } = renderHook(() => useSettings())
  act(() => result.current.update({ density: 'compact', weeklyReport: true }))
  act(() => result.current.reset())
  expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  expect(document.documentElement.dataset.density).toBeUndefined()
})
