import type {
  CSSProperties,
} from 'react'

interface PlatformCardProps {
  icon?: string
  title: string
  className?: string
  style?: CSSProperties
  onSelect?: () => void
}

export function PlatformCard({
  icon = '◆',
  title,
  className,
  style,
  onSelect,
}: PlatformCardProps) {
  return (
    <button
      type="button"
      className={[
        'platform-card',
        'premium-platform-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
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
