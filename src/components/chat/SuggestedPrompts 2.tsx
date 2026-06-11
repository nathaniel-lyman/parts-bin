export interface SuggestedPromptsProps {
  prompts: string[]
  onSelect: (prompt: string) => void
}

/** Empty-state prompt chips; clicking one sends it as the user's message. */
export function SuggestedPrompts({ prompts, onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="micro rounded-[2px] border border-line bg-surface-2 px-2 py-1 text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
