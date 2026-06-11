import { LoadingDots } from '../ui/LoadingAnimations'

export interface TypingIndicatorProps {
  className?: string
}

/** Pre-token "thinking" state; once tokens arrive the streaming cursor takes over. */
export function TypingIndicator({ className }: TypingIndicatorProps) {
  return <LoadingDots label="Assistant is thinking" className={className} />
}
