interface SpecialistButtonProps {
  onClick?: () => void
}

export function SpecialistButton({
  onClick,
}: SpecialistButtonProps) {
  return (
    <button
      type="button"
      className="specialist-button premium-specialist-button"
      onClick={onClick}
    >
      <span
        className="premium-specialist-button__icon"
        aria-hidden="true"
      >
        👤
      </span>

      <span className="premium-specialist-button__content">
        <span className="premium-specialist-button__eyebrow">
          تحتاج مساعدة مباشرة؟
        </span>

        <strong>
          تحدث مع مختص
        </strong>

        <span className="premium-specialist-button__hint">
          نوصل طلبك لفريق استثماركوم
        </span>
      </span>

      <span
        className="premium-specialist-button__action"
        aria-hidden="true"
      >
        ‹
      </span>
    </button>
  )
}
