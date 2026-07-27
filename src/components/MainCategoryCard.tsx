interface MainCategoryCardProps {
  icon: string
  title: string
  subtitle: string
  onSelect: () => void
}

export function MainCategoryCard({
  icon,
  title,
  subtitle,
  onSelect,
}: MainCategoryCardProps) {
  return (
    <button
      type="button"
      className="main-category-card premium-category-card"
      onClick={onSelect}
    >
      <span
        className="premium-category-card__icon"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="premium-category-card__content">
        <strong className="premium-category-card__title">
          {title}
        </strong>

        <span className="premium-category-card__subtitle">
          {subtitle}
        </span>
      </span>

      <span
        className="premium-category-card__action"
        aria-hidden="true"
      >
        <span>
          ‹
        </span>
      </span>
    </button>
  )
}
