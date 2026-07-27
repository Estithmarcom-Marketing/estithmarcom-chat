interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = 'جاري تجهيز المحادثة…',
}: LoadingStateProps) {
  return (
    <div
      className="loading-state"
      role="status"
      aria-live="polite"
    >
      <div
        className="loading-state__spinner"
        aria-hidden="true"
      />

      <span>
        {message}
      </span>
    </div>
  )
}
