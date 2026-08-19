import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = 'جاري تجهيز المحادثة…',
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center animate-chat-fade-in" role="status" aria-live="polite">
      <Loader2 className="w-7 h-7 text-secondary animate-spin" />
      <span className="text-xs font-semibold text-text-muted">{message}</span>
    </div>
  )
}
