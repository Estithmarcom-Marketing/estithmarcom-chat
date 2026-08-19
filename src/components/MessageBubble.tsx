import type { ChatMessage } from '../types'
import logo from '../assets/logo.png'

interface MessageBubbleProps {
  message: ChatMessage
  onSelectSuggestion?: (value: string) => void
}

interface MessageSuggestion {
  title: string
  value: string
}

function getMessageSuggestions(message: ChatMessage): MessageSuggestion[] {
  if (message.author !== 'assistant' || message.contentType !== 'input_select') return []
  const rawItems = message.contentAttributes?.items
  if (!Array.isArray(rawItems)) return []
  return rawItems
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const title = typeof record.title === 'string' ? record.title.trim() : ''
      const value = typeof record.value === 'string' ? record.value.trim() : ''
      if (!title || !value) return null
      return { title, value }
    })
    .filter((item): item is MessageSuggestion => item !== null)
}

export function MessageBubble({
  message,
  onSelectSuggestion,
}: MessageBubbleProps) {
  const isAssistant = message.author === 'assistant'
  const isHuman = message.author === 'human'
  const isCustomer = message.author === 'customer'

  const suggestions = getMessageSuggestions(message)

  const label = isAssistant ? 'مساعد استثماركوم' : isHuman ? 'فريق استثماركوم' : undefined

  if (isCustomer) {
    return (
      <div className="flex justify-end mb-3 animate-chat-bounce">
        <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-secondary text-white text-sm leading-relaxed max-w-[80%]">
          <p>{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start mb-3 animate-chat-bounce">
      <div className="w-7 h-7 rounded-full bg-primary shrink-0 mt-0.5 overflow-hidden flex items-center justify-center">
        <img src={logo} alt="logo" className="w-5 h-5 object-contain" />
      </div>
      <div className="mx-2 flex-1 min-w-0">
        {label && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-text-muted">{label}</span>
            {isHuman && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-secondary/10 text-secondary rounded-full">
                مختص
              </span>
            )}
          </div>
        )}
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%]">
          <p>{message.content}</p>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2" aria-label="خيارات مقترحة">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${message.id}-${index}-${suggestion.value}`}
                type="button"
                className="px-3 py-1.5 text-xs font-bold border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors rounded-xl text-gray-800"
                onClick={() => onSelectSuggestion?.(suggestion.value)}
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-soft">
          <time dateTime={message.createdAt}>
            {new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.createdAt))}
          </time>
        </div>
      </div>
    </div>
  )
}
