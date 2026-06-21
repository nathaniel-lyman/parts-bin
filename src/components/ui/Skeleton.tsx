import type { HTMLAttributes } from 'react'
import { cx } from './utils'

export type SkeletonProps = HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return <div aria-hidden="true" className={cx('h-4 animate-pulse rounded-sm bg-surface-2', className)} {...rest} />
}
