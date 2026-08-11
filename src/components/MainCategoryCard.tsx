interface MainCategoryCardProps {
  title: string
  subtitle: string
  onSelect: () => void
}

export function MainCategoryCard({
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
