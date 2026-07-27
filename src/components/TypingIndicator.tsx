export type TypingActor =
  | 'assistant'
  | 'human'

interface TypingIndicatorProps {
  actor: TypingActor
}

export function TypingIndicator({
  actor,
}: TypingIndicatorProps) {
  const isHuman =
    actor === 'human'

  const text =
    isHuman
      ? 'المختص يكتب…'
      : 'مساعد استثماركوم يجهز الخطوة التالية…'

  return (
    <div
      className={[
        'typing-indicator',
        'premium-typing-indicator',
        `typing-indicator--${actor}`,
        `premium-typing-indicator--${actor}`,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span
        className="premium-typing-indicator__avatar"
        aria-hidden="true"
      >
        {isHuman ? '👤' : '✦'}
      </span>

      <span className="premium-typing-indicator__text">
        {text}
      </span>

      <span
        className="premium-typing-indicator__dots"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}
