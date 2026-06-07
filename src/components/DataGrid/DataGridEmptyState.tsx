export function DataGridEmptyState({ query }: { query?: string }) {
  return (
    <div className="px-3 py-8 text-center text-muted">
      No results{query ? <> for "{query}"</> : null}
    </div>
  )
}

