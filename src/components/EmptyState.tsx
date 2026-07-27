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
    <section className="empty-state">
      <div
        className="empty-state__icon"
        aria-hidden="true"
      >
        !
      </div>

      <h2>
        {title}
      </h2>

      <p>
        {description}
      </p>

      <div className="empty-state__actions">
        <button
          type="button"
          className="empty-state__retry"
          onClick={onRetry}
        >
          إعادة المحاولة
        </button>

        <button
          type="button"
          className="empty-state__specialist"
          onClick={onRequestSpecialist}
        >
          👤 التحدث مع مختص
        </button>
      </div>
    </section>
  )
}
