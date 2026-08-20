import { X } from 'lucide-react'
import type { ChatMode } from '../types'
import logo from '../assets/logo.png'

interface ChatHeaderProps {
  mode: ChatMode
  humanConnected?: boolean
  onMinimize: () => void
  onClose: () => void
}

export function ChatHeader({
  mode,
  humanConnected = false,
  onClose,
}: ChatHeaderProps) {
  const title =
    mode === 'assistant'
      ? 'مساعد استثماركوم'
      : 'فريق استثماركوم'

  const status =
    mode === 'assistant'
      ? 'جاهز لمساعدتك'
      : mode === 'handoff_pending'
        ? 'جاري توصيلك بالمختص'
        : humanConnected
          ? 'مختص متصل'
          : 'تم تحويل طلبك'

  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
          <img src={logo} alt="logo" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <div className={`flex items-center gap-1.5 text-[11px] ${humanConnected ? 'text-secondary' : 'text-white/70'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${humanConnected ? 'bg-secondary animate-pulse-soft' : 'bg-white/50'}`} />
            <span>{status}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        onClick={onClose}
        aria-label="إغلاق المحادثة"
      >
        <X className="w-4 h-4" />
      </button>
    </header>
  )
}
