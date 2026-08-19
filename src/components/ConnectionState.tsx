import type { ConnectionStatus } from '../types'

interface ConnectionStateProps {
  status: ConnectionStatus
}

export function ConnectionState({
  status,
}: ConnectionStateProps) {
  if (status === 'connected') return null

  const content =
    status === 'reconnecting'
      ? { title: 'جاري استعادة الاتصال…', dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' }
      : status === 'connecting'
        ? { title: 'جاري الاتصال…', dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' }
        : { title: 'انقطع الاتصال مؤقتًا', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 mx-4 mb-1 text-xs font-semibold rounded-xl animate-chat-fade-in ${content.bg} ${content.text}`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse-soft ${content.dot}`} />
      <span>{content.title}</span>
    </div>
  )
}
