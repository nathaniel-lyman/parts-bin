import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// Node 25 exposes an experimental global `localStorage` (Web Storage API) that shadows
// jsdom's implementation and lacks working setItem/getItem/clear without --localstorage-file.
// Install a clean in-memory Storage so the app's localStorage-backed hooks behave correctly
// under test. This only affects the test environment; app/source files are untouched.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear() {
    this.store.clear()
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string) {
    this.store.delete(key)
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

const memoryStorage = new MemoryStorage()
const define = (target: object) =>
  Object.defineProperty(target, 'localStorage', {
    configurable: true,
    get: () => memoryStorage,
  })

define(globalThis)
if (typeof window !== 'undefined') define(window)

beforeEach(() => memoryStorage.clear())
