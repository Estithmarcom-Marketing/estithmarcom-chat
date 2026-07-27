interface PlatformCardProps {
  icon?: string
  title: string
  onSelect?: () => void
}

export function PlatformCard({
  icon = '◆',
  title,
  onSelect,
}: PlatformCardProps) {
  return (
    <button
      type="button"
      className="platform-card premium-platform-card"
      onClick={onSelect}
    >
      <span
        className="premium-platform-card__icon"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="premium-platform-card__content">
        <strong className="premium-platform-card__title">
          {title}
        </strong>

        <span className="premium-platform-card__hint">
          استعرض الخدمات
        </span>
      </span>

      <span
        className="premium-platform-card__action"
        aria-hidden="true"
      >
        ‹
      </span>
    </button>
  )
}
