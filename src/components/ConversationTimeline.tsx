import type { ChatMessage } from '../types'
import { MessageBubble } from './index'

interface ConversationTimelineProps {
  messages: ChatMessage[]
  onSelectSuggestion?: (value: string) => void
}

const INTERNAL_HANDOFF_REQUEST =
  'أريد التحدث مع موظف مختص'

function isHiddenHandoffRequest(
  message: ChatMessage,
) {
  return (
    message.author === 'customer' &&
    message.content.trim() ===
      INTERNAL_HANDOFF_REQUEST
  )
}

export function ConversationTimeline({
  messages,
  onSelectSuggestion,
}: ConversationTimelineProps) {
  const visibleMessages =
    messages.filter(
      (message) =>
        !isHiddenHandoffRequest(message),
    )

  if (visibleMessages.length === 0) {
    return null
  }

  return (
    <section
      className="flex flex-col gap-3 px-3 py-4"
      aria-label="سجل المحادثة"
      aria-live="polite"
    >
      {visibleMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onSelectSuggestion={onSelectSuggestion}
        />
      ))}
    </section>
  )
}
