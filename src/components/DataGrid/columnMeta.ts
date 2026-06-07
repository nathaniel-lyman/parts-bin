import '@tanstack/react-table'
import type { FilterColumnType } from './filtering'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
    resizable?: boolean
    type?: FilterColumnType
    options?: string[]
  }
}
