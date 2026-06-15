import { useState, type FormEvent } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { appHref, navigate } from '../../lib/routes'
import {
  Button,
  Checkbox,
  Field,
  InlineAlert,
  Input,
  PageTitle,
} from '../ui'
import { BrandLockup } from '../shell'

/** Marketing proof points shown on the brand panel — pure demo copy. */
const proofStats: { value: string; label: string }[] = [
  { value: '12', label: 'example templates' },
  { value: '~100', label: 'component surfaces' },
  { value: '1', label: 'theme folder' },
]

/**
 * Split brand-panel sign-in — the kit's "front door". Rendered full-bleed
 * (no AppShell) by App when the route is `/login`. Presentational demo only:
 * any non-empty credentials route to the dashboard; there is no real auth.
 */
export function LoginPage() {
  const { mode, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter both an email and password to continue.')
      return
    }
    setError(null)
    setLoading(true)
    // Simulate an async sign-in, then enter the app. Demo only — no backend.
    window.setTimeout(() => { navigate('/') }, 600)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg text-ink md:grid-cols-2">
      {/* Brand panel — hidden on small screens to keep the form front-and-center. */}
      <aside className="hidden flex-col justify-between border-r border-line bg-surface p-10 md:flex">
        <BrandLockup mark="#" href={appHref('/')}>parts-kit</BrandLockup>
        <div className="grid gap-3">
          <p className="display m-0 text-[32px] font-semibold leading-tight text-ink">
            Example app surfaces,<br />ready to adapt.
          </p>
          <p className="m-0 max-w-sm text-[14px] text-muted">
            parts-kit gives you token-only components and template screens. Clone it, re-skin it from
            one folder, and replace the example copy with your product language.
          </p>
        </div>
        <dl className="m-0 grid grid-cols-3 gap-4 border-t border-line pt-6">
          {proofStats.map((stat) => (
            <div key={stat.label} className="grid gap-1">
              <dt className="num text-[22px] font-semibold text-ink">{stat.value}</dt>
              <dd className="micro m-0">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Form panel. */}
      <main className="relative flex items-center justify-center p-6">
        <Button
          className="absolute right-6 top-6"
          size="compact"
          onClick={toggle}
          aria-label="Toggle color mode"
        >
          {mode === 'dark' ? 'Light' : 'Dark'}
        </Button>

        <div className="w-full max-w-[360px]">
          <div className="mb-6 grid gap-1 md:hidden">
            <BrandLockup mark="#" href={appHref('/')}>parts-kit</BrandLockup>
          </div>

          <div className="mb-6 grid gap-1">
            <PageTitle>Sign in</PageTitle>
            <p className="m-0 text-[13px] text-muted">Example pre-auth screen; wire it to your own auth flow.</p>
          </div>

          {error && (
            <InlineAlert tone="neg" title="Check your details" className="mb-4">
              {error}
            </InlineAlert>
          )}

          <form className="grid gap-4" onSubmit={onSubmit} noValidate>
            <Field label="Email">
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between">
              <Checkbox label="Remember me" defaultChecked />
              <a href={appHref('/login')} className="text-[13px] font-medium text-accent hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" loading={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="flex items-center gap-3 text-muted">
              <span className="h-px flex-1 bg-line" />
              <span className="micro">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <Button type="button" variant="secondary" onClick={() => { navigate('/') }}>
              Continue with SSO
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted">
            No account?{' '}
            <a href={appHref('/login')} className="font-medium text-accent hover:underline">Create one</a>
          </p>
          <p className="micro mt-4 text-center">Demo — any credentials sign you in.</p>
        </div>
      </main>
    </div>
  )
}
