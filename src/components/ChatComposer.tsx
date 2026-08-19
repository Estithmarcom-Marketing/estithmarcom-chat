import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatComposerProps {
  disabled?: boolean
  onSend?: (message: string) => void
}

export function ChatComposer({
  disabled = false,
  onSend,
}: ChatComposerProps) {
  const [message, setMessage] = useState('')
  const trimmedMessage = message.trim()
  const canSend = !disabled && trimmedMessage.length > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSend) return
    onSend?.(trimmedMessage)
    setMessage('')
  }

  return (
    <form
      className={`shrink-0 border-t border-gray-100 px-4 py-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="اكتب سؤالك هنا..."
          aria-label="اكتب رسالتك"
          disabled={disabled}
          autoComplete="off"
          dir="rtl"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="h-10 px-4 rounded-full bg-secondary disabled:bg-gray-300 text-white flex items-center gap-1.5 shrink-0 transition-colors text-sm font-medium"
          aria-label="إرسال الرسالة"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
