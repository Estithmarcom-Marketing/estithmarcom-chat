import { ChevronLeft } from 'lucide-react'

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
    <nav className="flex items-center gap-1 px-4 py-2.5 text-xs text-text-muted border-b border-gray-100" aria-label="مسار التنقل">
      {items.map((item, index) => (
        <span key={item.id} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronLeft className="w-3 h-3 text-text-soft rtl:rotate-180" />
          )}
          {item.current ? (
            <span className="font-bold text-gray-800" aria-current="page">{item.label}</span>
          ) : (
            <button
              type="button"
              className="font-semibold text-secondary hover:underline transition-colors"
              onClick={() => onNavigate?.(item.id)}
            >
              {item.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}
