import { expect, test } from 'vitest'
import { appHref, appPath } from './routes'

// Root deploy (dev, tests, custom domain): everything is a no-op.
test('appPath is identity at root base', () => {
  expect(appPath('/', '/')).toBe('/')
  expect(appPath('/docs', '/')).toBe('/docs')
  expect(appPath('/templates/customer-success', '/')).toBe('/templates/customer-success')
})

test('appHref is identity at root base', () => {
  expect(appHref('/', '/')).toBe('/')
  expect(appHref('/docs', '/')).toBe('/docs')
})

// Subpath deploy (GitHub Pages: --base=/dashboard-theme/).
test('appPath strips the subpath base', () => {
  expect(appPath('/dashboard-theme/', '/dashboard-theme/')).toBe('/')
  expect(appPath('/dashboard-theme', '/dashboard-theme/')).toBe('/')
  expect(appPath('/dashboard-theme/docs', '/dashboard-theme/')).toBe('/docs')
  expect(appPath('/dashboard-theme/templates/customer-success', '/dashboard-theme/')).toBe('/templates/customer-success')
})

test('appPath does not strip a same-prefix sibling path', () => {
  expect(appPath('/dashboard-theme-other/docs', '/dashboard-theme/')).toBe('/dashboard-theme-other/docs')
})

test('appHref prefixes the subpath base', () => {
  expect(appHref('/', '/dashboard-theme/')).toBe('/dashboard-theme/')
  expect(appHref('/docs', '/dashboard-theme/')).toBe('/dashboard-theme/docs')
  expect(appHref('/login', '/dashboard-theme/')).toBe('/dashboard-theme/login')
})

test('appPath and appHref round-trip', () => {
  for (const base of ['/', '/dashboard-theme/']) {
    for (const path of ['/', '/compose', '/docs', '/docs/start', '/login', '/settings', '/templates/recommendation-review']) {
      expect(appPath(appHref(path, base), base)).toBe(path)
    }
  }
})
