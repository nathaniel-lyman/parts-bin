/**
 * Base-aware routing helpers. The app's manual router matches app-relative
 * paths ('/docs', '/login', …), but a static host may serve the app from a
 * subpath (GitHub Pages: /dashboard-theme/). Vite injects that prefix as
 * import.meta.env.BASE_URL ('/' in dev/test; the --base flag at build time).
 *
 * All route matching should go through appPath() and all link hrefs /
 * navigations through appHref() / navigate(), so the app works identically at
 * the domain root and under a subpath. The base parameter exists for tests;
 * call sites never pass it.
 */

const BASE = import.meta.env.BASE_URL

/** '/dashboard-theme/' -> '/dashboard-theme'; '/' -> ''. */
function normalizedBase(base: string): string {
  return base.endsWith('/') ? base.slice(0, -1) : base
}

/** Current app-relative path: strips the deploy base from location.pathname. */
export function appPath(pathname: string = window.location.pathname, base: string = BASE): string {
  const prefix = normalizedBase(base)
  if (prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    pathname = pathname.slice(prefix.length)
  }
  return pathname === '' ? '/' : pathname
}

/** Deploy-absolute href for an app-relative path: appHref('/docs') -> '/dashboard-theme/docs'. */
export function appHref(path: string, base: string = BASE): string {
  return `${normalizedBase(base)}${path}` || '/'
}

/** Full-page navigation to an app-relative path, honoring the deploy base. */
export function navigate(path: string): void {
  window.location.href = appHref(path)
}
