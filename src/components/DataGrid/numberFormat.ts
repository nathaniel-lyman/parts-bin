import type { DataGridNumberFormat, GridColumnType } from './types'

export const NUMBER_FORMAT_STYLES = ['number', 'currency', 'percent'] as const
export const NUMBER_FORMAT_NOTATIONS = ['standard', 'compact'] as const
export const NUMBER_FORMAT_SIGN_DISPLAYS = ['auto', 'always', 'exceptZero', 'never'] as const
export const NUMBER_FORMAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] as const

export function isNumericColumnType(type?: GridColumnType): boolean {
  return type === 'number' || type === 'currency' || type === 'percent'
}

export function defaultNumberFormat(type?: GridColumnType): DataGridNumberFormat {
  if (type === 'currency') {
    return {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'standard',
      signDisplay: 'auto',
      useGrouping: true,
    }
  }
  if (type === 'percent') {
    return {
      style: 'percent',
      scale: 0.01,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      notation: 'standard',
      signDisplay: 'auto',
      useGrouping: true,
    }
  }
  return {
    style: 'number',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'standard',
    signDisplay: 'auto',
    useGrouping: true,
  }
}

export function resolveNumberFormat(
  type: GridColumnType | undefined,
  columnFormat?: DataGridNumberFormat,
  override?: DataGridNumberFormat,
): DataGridNumberFormat {
  return {
    ...defaultNumberFormat(type),
    ...columnFormat,
    ...override,
  }
}

function normalizeFractionDigits(format: DataGridNumberFormat): Pick<Intl.NumberFormatOptions, 'minimumFractionDigits' | 'maximumFractionDigits'> {
  const minimum = clampFraction(format.minimumFractionDigits)
  const maximum = clampFraction(format.maximumFractionDigits)
  if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
    return { minimumFractionDigits: maximum, maximumFractionDigits: maximum }
  }
  return { minimumFractionDigits: minimum, maximumFractionDigits: maximum }
}

function clampFraction(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(value)
  if (!Number.isFinite(number)) return undefined
  return Math.max(0, Math.min(20, Math.trunc(number)))
}

export function formatDataGridNumber(
  value: unknown,
  type: GridColumnType | undefined,
  columnFormat?: DataGridNumberFormat,
  override?: DataGridNumberFormat,
): string {
  if (value === null || value === undefined || value === '') return ''
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number) || typeof value === 'boolean') return String(value)
  const format = resolveNumberFormat(type, columnFormat, override)
  const style = format.style ?? 'number'
  const scaled = number * (format.scale ?? 1)
  const options: Intl.NumberFormatOptions = {
    style: style === 'number' ? 'decimal' : style,
    notation: format.notation ?? 'standard',
    signDisplay: format.signDisplay ?? 'auto',
    useGrouping: format.useGrouping ?? true,
    ...normalizeFractionDigits(format),
  }
  if (style === 'currency') {
    options.currency = format.currency ?? 'USD'
    options.currencySign = format.currencySign ?? 'standard'
  }
  return new Intl.NumberFormat('en-US', options).format(scaled)
}
