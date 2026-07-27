import type {
  ChatMessage,
} from '../types'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isAssistant =
    message.author === 'assistant'

  const isHuman =
    message.author === 'human'

  const isCustomer =
    message.author === 'customer'

  const label =
    isAssistant
      ? 'مساعد استثماركوم'
      : isHuman
        ? 'فريق استثماركوم'
        : undefined

  const avatar =
    isAssistant
      ? '✦'
      : isHuman
        ? '👤'
        : undefined

  return (
    <article
      className={[
        'message-bubble',
        'premium-message-bubble',
        `message-bubble--${message.author}`,
        `premium-message-bubble--${message.author}`,
      ].join(' ')}
    >
      {label && (
        <div className="premium-message-bubble__identity">
          <span
            className="premium-message-bubble__avatar"
            aria-hidden="true"
          >
            {avatar}
          </span>

          <span className="premium-message-bubble__label">
            {label}
          </span>

          {isHuman && (
            <span className="premium-message-bubble__human-badge">
              مختص
            </span>
          )}
        </div>
      )}

      <div className="premium-message-bubble__content">
        {message.content}
      </div>

      <div className="premium-message-bubble__meta">
        <time
          dateTime={message.createdAt}
        >
          {new Intl.DateTimeFormat(
            'ar-SA',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          ).format(
            new Date(message.createdAt),
          )}
        </time>

        {isCustomer && (
          <span
            aria-label="تم الإرسال"
            title="تم الإرسال"
          >
            ✓
          </span>
        )}
      </div>
    </article>
  )
}
