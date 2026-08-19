import { ChevronLeft } from 'lucide-react'
import type { CSSProperties } from 'react'

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
      className={`w-full text-start px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors text-sm font-medium text-gray-800 flex items-center justify-between group cursor-pointer ${className ?? ''}`}
      style={style}
      onClick={onSelect}
    >
      <span className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-xs text-secondary shrink-0" aria-hidden="true">
          {icon}
        </span>
        <strong className="text-sm font-bold text-gray-800">{title}</strong>
      </span>
      <ChevronLeft className="w-4 h-4 text-secondary group-hover:translate-x-[-2px] rtl:rotate-180 transition-transform shrink-0" />
    </button>
  )
}
