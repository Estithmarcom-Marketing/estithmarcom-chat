import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

interface ChatLauncherProps {
  onOpen: () => void
  showGreeting?: boolean
}

export function ChatLauncher({
  onOpen,
  showGreeting = false,
}: ChatLauncherProps) {
  const [
    isGreetingVisible,
    setIsGreetingVisible,
  ] = useState(true)

  const shouldShowGreeting =
    showGreeting && isGreetingVisible

  return (
    <div
      className="fixed bottom-5 end-5 sm:bottom-6 sm:end-6 z-50 flex flex-col items-end gap-2"
    >
      {shouldShowGreeting && (
        <div className="flex items-center gap-2 animate-chat-fade-up">
          <button
            type="button"
            className="min-h-10 max-w-[calc(100vw-6.5rem)] rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-[0_10px_30px_rgba(15,23,42,0.18)] border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onOpen}
            dir="rtl"
          >
            مرحبًا، هل تحتاج إلى مساعدة؟
          </button>

          <button
            type="button"
            className="w-10 h-10 shrink-0 rounded-full bg-white text-gray-600 shadow-[0_8px_24px_rgba(15,23,42,0.16)] border border-gray-100 flex items-center justify-center hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() =>
              setIsGreetingVisible(false)
            }
            aria-label="إخفاء رسالة الترحيب"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <button
        type="button"
        className="w-14 h-14 rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.24)] flex items-center justify-center bg-secondary hover:bg-secondary/85 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        onClick={onOpen}
        aria-label="فتح محادثة استثماركوم"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}
