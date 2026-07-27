import type {
  ChatMode,
} from '../types'

interface ChatHeaderProps {
  mode: ChatMode
  humanConnected?: boolean
  onMinimize: () => void
  onClose: () => void
}

export function ChatHeader({
  mode,
  humanConnected = false,
  onMinimize,
  onClose,
}: ChatHeaderProps) {
  const isAssistant =
    mode === 'assistant'

  const title =
    isAssistant
      ? 'مساعد استثماركوم'
      : 'فريق استثماركوم'

  const status =
    isAssistant
      ? 'جاهز لمساعدتك'
      : humanConnected
        ? 'مختص متصل'
        : 'تم تحويل طلبك'

  return (
    <header className="chat-header">
      <div className="chat-header__identity">
        <div
          className="chat-header__logo"
          aria-hidden="true"
        >
          إ
        </div>

        <div>
          <strong className="chat-header__title">
            {title}
          </strong>

          <div
            className={[
              'chat-header__status',
              humanConnected
                ? 'chat-header__status--connected'
                : '',
            ].join(' ')}
          >
            <span
              className="chat-header__status-dot"
              aria-hidden="true"
            />

            <span>
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-header__actions">
        <button
          type="button"
          className="chat-header__action"
          onClick={onMinimize}
          aria-label="تصغير المحادثة"
        >
          −
        </button>

        <button
          type="button"
          className="chat-header__action"
          onClick={onClose}
          aria-label="إغلاق المحادثة"
        >
          ×
        </button>
      </div>
    </header>
  )
}
