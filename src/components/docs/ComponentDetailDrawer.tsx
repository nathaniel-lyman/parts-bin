import { Drawer } from '../ui'
import type { ComponentEntry } from '../catalog'
import { demos } from './demoRegistry'

/**
 * Demos that open their own focus-trapped overlay (Drawer has no portal, so a
 * nested trap would fight this drawer's). Their snippet still shows usage.
 */
const DRAWER_DEMO_EXCLUSIONS = new Set(['Drawer', 'CommandPalette'])

export function ComponentDetailDrawer({ entry, onClose }: { entry: ComponentEntry; onClose: () => void }) {
  const demo = DRAWER_DEMO_EXCLUSIONS.has(entry.name) ? undefined : demos[entry.name]
  return (
    <Drawer title={entry.name} onClose={onClose}>
      <div className="grid gap-3">
        <code className="micro text-muted">{entry.import}</code>
        <p className="m-0 text-[13px] text-ink">{entry.purpose}</p>
        <p className="m-0 micro text-muted">Use when: {entry.use_when}</p>
        {entry.prefer_over && (
          <ul className="m-0 micro text-muted list-disc pl-4">
            {Object.entries(entry.prefer_over).map(([twin, why]) => (
              <li key={twin}>
                vs <strong className="text-ink">{twin}</strong>: {why}
              </li>
            ))}
          </ul>
        )}
        {entry.related && entry.related.length > 0 && (
          <p className="m-0 micro text-muted">related: {entry.related.join(', ')}</p>
        )}
        <p className="m-0 micro text-muted">props: {entry.props.join(', ')}</p>
        {entry.variants && (
          <p className="m-0 micro text-muted">
            {Object.entries(entry.variants)
              .map(([prop, values]) => `${prop}: ${values.join(' | ')}`)
              .join('   ')}
          </p>
        )}
        <pre className="micro bg-surface-2 border border-line rounded-[2px] p-2 overflow-x-auto">
          <code>{entry.snippet}</code>
        </pre>
        {demo && (
          <div data-testid="drawer-demo" className="border-t border-line pt-3">
            {demo}
          </div>
        )}
      </div>
    </Drawer>
  )
}
