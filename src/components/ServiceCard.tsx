interface ServiceCardProps {
  title: string
  onSelect?: () => void
}

export function ServiceCard({
  title,
  onSelect,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      className="service-card premium-service-card"
      onClick={onSelect}
    >
      <span
        className="premium-service-card__icon"
        aria-hidden="true"
      >
        ✦
      </span>

      <span className="premium-service-card__content">
        <strong className="premium-service-card__title">
          {title}
        </strong>

        <span className="premium-service-card__hint">
          اختر الخدمة للمتابعة
        </span>
      </span>

      <span
        className="premium-service-card__arrow"
        aria-hidden="true"
      >
        ‹
      </span>
    </button>
  )
}
