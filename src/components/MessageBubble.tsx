import type {
  ChatMessage,
} from '../types'

interface MessageBubbleProps {
  message: ChatMessage

  onSelectSuggestion?: (
    value: string,
  ) => void
}

interface MessageSuggestion {
  title: string
  value: string
}

function getMessageSuggestions(
  message: ChatMessage,
): MessageSuggestion[] {
  if (
    message.author !==
      'assistant' ||
    message.contentType !==
      'input_select'
  ) {
    return []
  }

  const rawItems =
    message
      .contentAttributes
      ?.items

  if (!Array.isArray(rawItems)) {
    return []
  }

  return rawItems
    .map((item) => {
      if (
        !item ||
        typeof item !==
          'object'
      ) {
        return null
      }

      const record =
        item as Record<
          string,
          unknown
        >

      const title =
        typeof record.title ===
        'string'
          ? record.title.trim()
          : ''

      const value =
        typeof record.value ===
        'string'
          ? record.value.trim()
          : ''

      if (
        !title ||
        !value
      ) {
        return null
      }

      return {
        title,
        value,
      }
    })
    .filter(
      (
        item,
      ): item is MessageSuggestion =>
        item !== null,
    )
}

export function MessageBubble({
  message,
  onSelectSuggestion,
}: MessageBubbleProps) {
  const isAssistant =
    message.author ===
    'assistant'

  const isHuman =
    message.author === 'human'

  const isCustomer =
    message.author ===
    'customer'

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

  const suggestions =
    getMessageSuggestions(
      message,
    )

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

      {suggestions.length > 0 && (
        <div
          className="premium-message-bubble__suggestions"
          aria-label="خيارات مقترحة"
        >
          {suggestions.map(
            (
              suggestion,
              index,
            ) => (
              <button
                key={`${message.id}-${index}-${suggestion.value}`}
                type="button"
                className="premium-message-bubble__suggestion"
                onClick={() => {
                  onSelectSuggestion?.(
                    suggestion.value,
                  )
                }}
              >
                {suggestion.title}
              </button>
            ),
          )}
        </div>
      )}

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
            new Date(
              message.createdAt,
            ),
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
