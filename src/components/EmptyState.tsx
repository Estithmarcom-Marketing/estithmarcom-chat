import { AlertCircle, User } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  onRequestSpecialist?: () => void
}

export function EmptyState({
  title = 'تعذر تحميل المحتوى',
  description = 'يمكنك المحاولة مرة أخرى أو التواصل مع مختص.',
  onRetry,
  onRequestSpecialist,
}: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-3 py-8 px-5 text-center animate-chat-fade-in">
      <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      <p className="text-xs text-text-muted leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold text-white bg-secondary hover:bg-secondary/90 rounded-xl transition-colors cursor-pointer"
          onClick={onRetry}
        >
          إعادة المحاولة
        </button>
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold text-secondary border border-secondary/30 bg-white hover:bg-secondary/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          onClick={onRequestSpecialist}
        >
          <User className="w-3.5 h-3.5" />
          <span>التحدث مع مختص</span>
        </button>
      </div>
    </section>
  )
}
