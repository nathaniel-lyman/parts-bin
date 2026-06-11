import { useMemo, useState } from 'react'
import { CATALOG, CATEGORIES, type Category, type ComponentEntry } from '../catalog'
import { Input } from '../ui'
import { SectionHeader } from '../shell'
import { previews } from './previewRegistry'

const CATEGORY_LABELS: Record<Category, string> = {
  primitive: 'UI primitives',
  form: 'Form controls',
  overlay: 'Overlays',
  feedback: 'Feedback & loading',
  'data-display': 'Data display',
  chart: 'Charts',
  datagrid: 'DataGrid',
  map: 'Maps',
  chat: 'AI chat',
  shell: 'Shell',
  starter: 'Starters & templates',
}

function PlaceholderTile({ entry }: { entry: ComponentEntry }) {
  return (
    <div className="grid place-items-center gap-1 border border-dashed border-line px-4 py-3 text-center">
      <span className="display text-[15px] font-semibold text-muted">{entry.name}</span>
      <span className="micro text-faint">{CATEGORY_LABELS[entry.category]}</span>
    </div>
  )
}

function GalleryCard({ entry, onSelect }: { entry: ComponentEntry; onSelect: (entry: ComponentEntry) => void }) {
  return (
    <article className="relative border border-line bg-surface transition-colors hover:border-accent focus-within:border-accent">
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none flex h-[128px] items-center justify-center overflow-hidden border-b border-line bg-surface-2 p-4"
      >
        {previews[entry.name] ?? <PlaceholderTile entry={entry} />}
      </div>
      <div className="grid gap-0.5 p-3">
        <h3 className="m-0 text-[13px] font-semibold text-ink">{entry.name}</h3>
        <p className="m-0 micro text-muted">{entry.purpose}</p>
      </div>
      <button
        type="button"
        aria-label={entry.name}
        onClick={() => onSelect(entry)}
        className="absolute inset-0 z-10 cursor-pointer"
      />
    </article>
  )
}

export function ComponentGallery({
  onSelect,
  externalQuery = '',
}: {
  onSelect: (entry: ComponentEntry) => void
  /** Extra query ANDed with the local search box — lets the shell's global search drive the gallery. */
  externalQuery?: string
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const ext = externalQuery.trim().toLowerCase()
  const filtered = useMemo(() => {
    const terms = [q, ext].filter(Boolean)
    return CATALOG.filter((e) => terms.every((t) => e.name.toLowerCase().includes(t) || e.purpose.toLowerCase().includes(t)))
  }, [q, ext])
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-64">
          <Input
            type="search"
            aria-label="Search components"
            placeholder={`Search ${CATALOG.length} components…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <nav aria-label="Component categories" className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`#gallery-${cat}`}
              className="micro border border-line bg-surface-2 px-2 py-1 text-muted hover:border-accent hover:text-ink"
            >
              {CATEGORY_LABELS[cat]}
            </a>
          ))}
        </nav>
      </div>
      {CATEGORIES.map((cat) => {
        const entries = filtered.filter((entry) => entry.category === cat)
        if (entries.length === 0) return null
        return (
          <section key={cat} id={`gallery-${cat}`}>
            <SectionHeader
              title={CATEGORY_LABELS[cat]}
              description={`${entries.length} ${entries.length === 1 ? 'component' : 'components'}`}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {entries.map((entry) => (
                <GalleryCard key={entry.name} entry={entry} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
