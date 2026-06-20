import { Skeleton } from 'parts-bin'

export function TextLines() {
  return (
    <div style={{ display: 'grid', gap: 10, width: 280 }}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[85%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
  )
}

export function CardPlaceholder() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        width: 320,
        padding: 16,
        border: '1px solid var(--line)',
        borderRadius: 10,
      }}
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div style={{ display: 'grid', gap: 8, flex: 1 }}>
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="h-3 w-[45%]" />
      </div>
    </div>
  )
}
