import type { ComponentProps, ComponentType } from 'react'

export const CATEGORIES = [
  'primitive', 'form', 'overlay', 'feedback',
  'data-display', 'chart', 'datagrid', 'map', 'shell', 'starter',
] as const
export type Category = (typeof CATEGORIES)[number]

export interface ComponentEntry {
  /** Display name; matches the barrel export name. */
  name: string
  /** The actual exported component value — enables identity-based coverage. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  /** Subsystem barrel to import from, e.g. './components/ui'. */
  import: string
  category: Category
  /** One line: what it is. */
  purpose: string
  /** When to reach for this component. */
  use_when: string
  /** Disambiguation vs near-twins: twin name -> why pick this / the other. */
  prefer_over?: Record<string, string>
  /** Key prop names — compile-time verified to be real props (see factory). */
  props: readonly string[]
  /** Enumerated variant props, e.g. { variant: ['primary','ghost'] }. */
  variants?: Record<string, readonly string[]>
  /** Sibling component names worth knowing about (must be cataloged). */
  related?: readonly string[]
  /** Minimal copy-paste JSX. */
  snippet: string
}

/**
 * Type-safe entry constructor. `props` is constrained to keys of the component's
 * own props type, so a fictional/misspelled prop is a compile error (caught by
 * `npm run build`). Props derive from the component value, so components need not
 * export a named props interface.
 */
export function defineComponent<C extends ComponentType<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  component: C,
  entry: Omit<ComponentEntry, 'component' | 'props'> & {
    props: readonly (keyof ComponentProps<C> & string)[]
  },
): ComponentEntry {
  return { ...entry, component, props: [...entry.props] }
}

/**
 * Real components deliberately NOT cataloged: each is composed by a documented
 * parent and should not be reached for directly. The reason strings double as
 * guidance. Seeded from the spec; reconcile against the runtime enumeration in
 * Task 3.
 */
export const INTERNAL = new Map<string, string>([
  // DataGrid composition pieces — use <DataGrid>, not these directly:
  ['DataGridHeader', 'Composed by DataGrid'],
  ['DataGridBody', 'Composed by DataGrid'],
  ['DataGridRow', 'Composed by DataGrid'],
  ['DataGridCell', 'Composed by DataGrid'],
  ['DataGridToolbar', 'Composed by DataGrid'],
  ['DataGridFooter', 'Composed by DataGrid'],
  ['DataGridColumnDragOverlay', 'Composed by DataGrid'],
  ['DataGridRowCheckbox', 'Composed by DataGrid selection column'],
  ['DataGridSelectAllCheckbox', 'Composed by DataGrid header'],
  // ui sub-fragments — rendered by a documented parent:
  ['PageTitle', 'Rendered by PageHeader'],
  ['PageSubtitle', 'Rendered by PageHeader'],
  ['EventRow', 'Rendered by ActivityFeed / Timeline'],
  ['PresenceBadge', 'Rendered by Avatar (status dot)'],
  ['FilterChip', 'Rendered by AppliedFiltersBar'],
  // shell nav fragments — composed by AppShell / Sidebar:
  ['NavigationItem', 'Composed by Sidebar'],
  ['ActiveNavigationItem', 'NavigationItem with active preset; composed by Sidebar'],
  ['AdminNavigationItem', 'Composed by Sidebar'],
  ['AdminSectionDivider', 'Composed by Sidebar'],
  ['CollapseSidebarControl', 'Composed by Sidebar'],
  ['BrandLockup', 'Composed by Sidebar / TopNav'],
  ['LeftNavigationDrawer', 'Composed by AppShell'],
])

/** Capitalized function exports that are NOT components (currently none). */
export const NON_COMPONENT_OVERRIDES = new Set<string>([])

/** The catalog. Populated per subsystem in Chunk 2. */
export const CATALOG: ComponentEntry[] = []
