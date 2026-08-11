import type {
  ChatMessage,
} from '../types'

import {
  MessageBubble,
} from './index'

interface ConversationTimelineProps {
  messages: ChatMessage[]

  onSelectSuggestion?: (
    value: string,
  ) => void
}

export function ConversationTimeline({
  messages,
  onSelectSuggestion,
}: ConversationTimelineProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <section
      className="conversation-timeline premium-conversation-timeline"
      aria-label="سجل المحادثة"
      aria-live="polite"
    >
      {messages.map(
        (message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onSelectSuggestion={
              onSelectSuggestion
            }
          />
        ),
      )}
    </section>
  )
}
