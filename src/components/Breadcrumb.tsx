interface BreadcrumbProps {
  items: Array<{
    id: string
    label: string
    current?: boolean
  }>
  onNavigate?: (id: string) => void
}

export function Breadcrumb({
  items,
  onNavigate,
}: BreadcrumbProps) {
  return (
    <nav
      className="chat-breadcrumb"
      aria-label="مسار التنقل"
    >
      {items.map((item, index) => (
        <span
          key={item.id}
          className="chat-breadcrumb__item"
        >
          {index > 0 && (
            <span
              className="chat-breadcrumb__separator"
              aria-hidden="true"
            >
              ‹
            </span>
          )}

          {item.current ? (
            <span
              className="chat-breadcrumb__current"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <button
              type="button"
              className="chat-breadcrumb__button"
              onClick={() =>
                onNavigate?.(item.id)
              }
            >
              {item.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}
