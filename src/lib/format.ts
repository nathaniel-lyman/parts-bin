export const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
export const fmtCurrency = (n: number) => `$${fmtNum(n)}`
export const fmtPercent = (n: number) => `${Math.abs(n).toFixed(1)}%`
export const fmtDelta = (n: number) => fmtPercent(n)
// Signed percent without the directional icon — for clipboard copy, where a tool like Excel
// parses "-2.1%" into a real percentage.
export const fmtPercentSigned = (n: number) => `${n.toFixed(1)}%`
export const formatCompactKValue = (value: number) => {
  const absolute = Math.abs(value)
  return absolute >= 10 || Number.isInteger(absolute) ? absolute.toFixed(0) : absolute.toFixed(1)
}
export const formatCurrencyK = (value: number) => `${value < 0 ? '-' : ''}$${formatCompactKValue(value)}k`
