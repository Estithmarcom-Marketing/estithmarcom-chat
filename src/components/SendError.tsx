interface SendErrorProps {
  onRetry?: () => void
}

export function SendError({
  onRetry,
}: SendErrorProps) {
  return (
    <div className="flex items-center justify-between gap-3 mx-4 mb-1 px-3 py-2 text-xs bg-red-50 border border-red-200 text-red-600 rounded-xl animate-chat-fade-in" role="alert">
      <span className="font-semibold">تعذر الإرسال</span>
      <button
        type="button"
        className="px-3 py-1.5 text-[11px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
        onClick={onRetry}
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
