export * from './types'
export { useChat, type ChatController, type ChatStatus } from './useChat'
export {
  buildAssistantDashboardEvidence,
  buildRevenueMovementEvidence,
  type AssistantDashboardEvidence,
  type RevenueMovementEvidence,
  type RevenueMovementEvidencePoint,
} from './dashboardEvidence'
export {
  createDemoAdapter,
  contextualAssistantSuggestions,
  DEMO_SUGGESTIONS,
  type AssistantActions,
  type AssistantActionResult,
  type AssistantGridContext,
  type AssistantGridFilterRef,
  type AssistantGridSortRef,
  type AssistantRouteKind,
  type AssistantSavedViewRef,
  type AssistantScreenContext,
  type DemoAdapterOptions,
  type RecommendationFeedbackAction,
} from './demoAdapter'
export { ChatMarkdown, type ChatMarkdownProps } from './ChatMarkdown'
export { CodeBlock, type CodeBlockProps } from './CodeBlock'
export { ChatMessageBubble, type ChatMessageBubbleProps } from './ChatMessageBubble'
export { ChatMessageList, type ChatMessageListProps } from './ChatMessageList'
export { ChatComposer, type ChatComposerProps } from './ChatComposer'
export { MessageActions, type MessageActionsProps } from './MessageActions'
export { SuggestedPrompts, type SuggestedPromptsProps } from './SuggestedPrompts'
export { TypingIndicator, type TypingIndicatorProps } from './TypingIndicator'
export { AssistantPanel, type AssistantPanelProps } from './AssistantPanel'
