import { beforeEach, expect, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useTheme } from './useTheme'

beforeEach(() => { localStorage.clear(); document.documentElement.classList.remove('dark') })

test('defaults to light, no .dark class', () => {
  const { result } = renderHook(() => useTheme())
  expect(result.current.mode).toBe('light')
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('toggle persists dark to parts-bin.theme and adds .dark', () => {
  const { result } = renderHook(() => useTheme())
  act(() => result.current.toggle())
  expect(result.current.mode).toBe('dark')
  expect(localStorage.getItem('parts-bin.theme')).toBe('dark')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('rehydrates persisted dark on init', () => {
  localStorage.setItem('parts-bin.theme', 'dark')
  const { result } = renderHook(() => useTheme())
  expect(result.current.mode).toBe('dark')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('migrates persisted dark from previous parts-kit.theme', () => {
  localStorage.setItem('parts-kit.theme', 'dark')
  const { result } = renderHook(() => useTheme())
  expect(result.current.mode).toBe('dark')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('migrates persisted dark from legacy ledger.theme', () => {
  localStorage.setItem('ledger.theme', 'dark')
  const { result } = renderHook(() => useTheme())
  expect(result.current.mode).toBe('dark')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
