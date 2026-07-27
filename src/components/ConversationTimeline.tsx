import type {
  ChatMessage,
} from '../types'

import {
  MessageBubble,
} from './index'

interface ConversationTimelineProps {
  messages: ChatMessage[]
}

export function ConversationTimeline({
  messages,
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
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}
    </section>
  )
}
