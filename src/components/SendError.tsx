interface SendErrorProps {
  onRetry?: () => void
}

export function SendError({
  onRetry,
}: SendErrorProps) {
  return (
    <div
      className="send-error"
      role="alert"
    >
      <span>
        تعذر الإرسال
      </span>

      <button
        type="button"
        onClick={onRetry}
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
