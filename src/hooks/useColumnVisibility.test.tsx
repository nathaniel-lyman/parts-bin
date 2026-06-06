import { beforeEach, expect, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useColumnVisibility, DEFAULT_COLUMNS } from './useColumnVisibility'

beforeEach(() => localStorage.clear())

test('defaults: name visible, arr/since hidden (matches demo)', () => {
  const { result } = renderHook(() => useColumnVisibility())
  expect(result.current.visibility).toEqual(DEFAULT_COLUMNS)
  expect(result.current.visibility.name).toBe(true)  // Account column on by default
  expect(result.current.visibility.arr).toBe(false)
  expect(result.current.visibility.since).toBe(false)
})

test('toggle persists to ledger.cols', () => {
  const { result } = renderHook(() => useColumnVisibility())
  act(() => result.current.toggle('arr'))
  expect(result.current.visibility.arr).toBe(true)
  expect(JSON.parse(localStorage.getItem('ledger.cols')!).arr).toBe(true)
})

test('reads persisted value on init', () => {
  localStorage.setItem('ledger.cols', JSON.stringify({ ...DEFAULT_COLUMNS, since: true }))
  const { result } = renderHook(() => useColumnVisibility())
  expect(result.current.visibility.since).toBe(true)
})

test('merges partial persisted value over defaults', () => {
  localStorage.setItem('ledger.cols', JSON.stringify({ since: true }))
  const { result } = renderHook(() => useColumnVisibility())
  expect(result.current.visibility).toEqual({ name: true, arr: false, since: true })
})

test('falls back to defaults on malformed JSON', () => {
  localStorage.setItem('ledger.cols', '{not json')
  const { result } = renderHook(() => useColumnVisibility())
  expect(result.current.visibility).toEqual(DEFAULT_COLUMNS)
})
