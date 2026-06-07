export function DataGridErrorState({ error }: { error?: unknown }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <div className="px-3 py-8 text-center text-neg" role="alert">
      {message}
    </div>
  )
}

