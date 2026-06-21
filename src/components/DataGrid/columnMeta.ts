import '@tanstack/react-table'
import type { FilterColumnType } from './filtering'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
    resizable?: boolean
    type?: FilterColumnType
    options?: string[]
    /** True for the non-data action column (compact padding, no copy/range/filter). Set by the
     *  orchestrator from `type: 'actions'` / the legacy `id === 'actions'`. */
    actions?: boolean
  }
}
