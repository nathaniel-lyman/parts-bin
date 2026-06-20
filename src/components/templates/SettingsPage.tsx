import { useMemo, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { useSettings, type LedgerSettings } from '../../hooks/useSettings'
import { applyThemeRecipe, readStoredThemeRecipe, THEME_RECIPES, type ThemeRecipeId } from '../../theme/recipes'
import {
  Button,
  Combobox,
  Field,
  Input,
  MultiSelect,
  PageHeader,
  RadioGroup,
  SegmentedControl,
  Select,
  Switch,
  useToast,
} from '../ui'
import { SettingsPanel } from '../shell'
import { ConfirmDialog } from '../ConfirmDialog'

/** Fields edited through the staged save bar (appearance applies live instead). */
type StagedSettings = Pick<
  LedgerSettings,
  'fullName' | 'email' | 'role' | 'timezone' | 'emailDigest' | 'mentions' | 'weeklyReport' | 'channels' | 'landingPage' | 'numberFormat'
>

function pickStaged(settings: LedgerSettings): StagedSettings {
  const { fullName, email, role, timezone, emailDigest, mentions, weeklyReport, channels, landingPage, numberFormat } = settings
  return { fullName, email, role, timezone, emailDigest, mentions, weeklyReport, channels, landingPage, numberFormat }
}

const sections = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'danger', label: 'Danger zone' },
]

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
]

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern (New York)' },
  { value: 'America/Chicago', label: 'Central (Chicago)' },
  { value: 'America/Denver', label: 'Mountain (Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Berlin', label: 'CET (Berlin)' },
]

const channelOptions = [
  { value: 'in-app', label: 'In-app' },
  { value: 'email', label: 'Email' },
  { value: 'slack', label: 'Slack' },
  { value: 'sms', label: 'SMS' },
]

const landingOptions: { value: LedgerSettings['landingPage']; label: string }[] = [
  { value: '/docs', label: 'Components' },
  { value: '/examples/dashboard', label: 'Assembly demo' },
  { value: '/templates/customer-success', label: 'Customer success' },
  { value: '/templates/recommendation-review', label: 'Review queue' },
]

const recipeOptions = THEME_RECIPES.map((recipe) => ({
  value: recipe.id,
  label: recipe.name,
  description: recipe.bestFor,
}))

/**
 * Section-scroll settings starter. Appearance composes the three appearance
 * owners (color mode → useTheme, recipe → recipes.ts, density/reduceMotion →
 * useSettings) and applies them live. Profile / Notifications / Preferences are
 * staged into a local draft and committed through the sticky save bar.
 */
export function SettingsPage() {
  const { mode, toggle } = useTheme()
  const { settings, update } = useSettings()
  const toast = useToast()

  const [recipe, setRecipe] = useState<ThemeRecipeId>(() => readStoredThemeRecipe())
  const [draft, setDraft] = useState<StagedSettings>(() => pickStaged(settings))
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(pickStaged(settings)),
    [draft, settings],
  )

  const patch = (next: Partial<StagedSettings>) => setDraft((current) => ({ ...current, ...next }))

  const onSelectRecipe = (id: string) => {
    const next = id as ThemeRecipeId
    setRecipe(next)
    applyThemeRecipe(next)
  }

  const save = () => {
    update(draft)
    toast('Settings saved', 'pos')
  }

  const discard = () => setDraft(pickStaged(settings))

  return (
    <>
      <main className="w-full px-6 py-6 pb-20">
        <PageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Manage appearance, profile, notifications, and workspace preferences."
        />

        <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
          {/* Section nav. */}
          <nav aria-label="Settings sections" className="hidden lg:block">
            <ul className="sticky top-20 m-0 grid list-none gap-1 p-0">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-[2px] px-2 py-1.5 text-[13px] text-muted hover:bg-surface-2 hover:text-ink"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-6">
            {/* Appearance — applies live. */}
            <section id="appearance">
              <SettingsPanel title="Appearance" description="Re-skin the whole app — these apply instantly.">
                <Field label="Color mode" layout="horizontal">
                  <SegmentedControl
                    label="Color mode"
                    value={mode}
                    onValueChange={(value) => { if (value !== mode) toggle() }}
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                  />
                </Field>

                <RadioGroup
                  label="Theme recipe"
                  value={recipe}
                  onValueChange={onSelectRecipe}
                  options={recipeOptions}
                />

                <Field label="Density" layout="horizontal">
                  <SegmentedControl
                    label="Density"
                    value={settings.density}
                    onValueChange={(value) => update({ density: value as LedgerSettings['density'] })}
                    options={[
                      { value: 'comfortable', label: 'Comfortable' },
                      { value: 'compact', label: 'Compact' },
                    ]}
                  />
                </Field>

                <Switch
                  label="Reduce motion"
                  hint="Minimize non-essential animation."
                  checked={settings.reduceMotion}
                  onChange={(event) => update({ reduceMotion: event.target.checked })}
                />
              </SettingsPanel>
            </section>

            {/* Profile — staged. */}
            <section id="profile">
              <SettingsPanel title="Profile" description="How you appear across the workspace.">
                <Field label="Full name">
                  <Input value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={draft.email} onChange={(event) => patch({ email: event.target.value })} />
                </Field>
                <Field label="Role">
                  <Select value={draft.role} onChange={(event) => patch({ role: event.target.value })}>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Timezone">
                  <Combobox
                    options={timezoneOptions}
                    value={draft.timezone}
                    onValueChange={(value) => patch({ timezone: value })}
                    placeholder="Select a timezone"
                  />
                </Field>
              </SettingsPanel>
            </section>

            {/* Notifications — staged. */}
            <section id="notifications">
              <SettingsPanel title="Notifications" description="Choose what reaches you, and where.">
                <Switch
                  label="Email digest"
                  hint="A daily summary of account changes."
                  checked={draft.emailDigest}
                  onChange={(event) => patch({ emailDigest: event.target.checked })}
                />
                <Switch
                  label="Mentions"
                  hint="When a teammate @-mentions you."
                  checked={draft.mentions}
                  onChange={(event) => patch({ mentions: event.target.checked })}
                />
                <Switch
                  label="Weekly report"
                  hint="A Monday-morning revenue roundup."
                  checked={draft.weeklyReport}
                  onChange={(event) => patch({ weeklyReport: event.target.checked })}
                />
                <Field label="Delivery channels">
                  <MultiSelect
                    options={channelOptions}
                    values={draft.channels}
                    onValuesChange={(values) => patch({ channels: values })}
                    placeholder="Add a channel"
                  />
                </Field>
              </SettingsPanel>
            </section>

            {/* Preferences — staged. */}
            <section id="preferences">
              <SettingsPanel title="Preferences" description="Defaults for how the workspace behaves.">
                <Field label="Default landing page">
                  <Select
                    value={draft.landingPage}
                    onChange={(event) => patch({ landingPage: event.target.value as LedgerSettings['landingPage'] })}
                  >
                    {landingOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Number format" layout="horizontal">
                  <SegmentedControl
                    label="Number format"
                    value={draft.numberFormat}
                    onValueChange={(value) => patch({ numberFormat: value as LedgerSettings['numberFormat'] })}
                    options={[
                      { value: 'full', label: 'Full' },
                      { value: 'compact', label: 'Compact' },
                    ]}
                  />
                </Field>
              </SettingsPanel>
            </section>

            {/* Danger zone. */}
            <section id="danger">
              <SettingsPanel title="Danger zone" description="Irreversible actions for this workspace.">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="m-0 text-[13px] text-muted">
                    Delete this workspace and everything in it. This cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                    Delete workspace
                  </Button>
                </div>
              </SettingsPanel>
            </section>
          </div>
        </div>
      </main>

      {/* Sticky save bar — only when the staged draft differs from saved settings. */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-6 py-3">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3">
            <span className="text-[13px] text-muted">You have unsaved changes.</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={discard}>Discard</Button>
              <Button variant="primary" onClick={save}>Save changes</Button>
            </div>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete workspace"
          message="This permanently deletes the workspace and all of its data. (Demo — nothing is actually removed.)"
          confirmLabel="Delete workspace"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => { setConfirmingDelete(false); toast('Workspace deleted', 'neg') }}
        />
      )}
    </>
  )
}
