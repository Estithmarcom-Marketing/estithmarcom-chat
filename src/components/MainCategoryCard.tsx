import { ChevronLeft } from 'lucide-react'

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
      className="w-full text-start px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors text-sm font-medium text-gray-800 flex items-center justify-between group cursor-pointer"
      onClick={onSelect}
    >
      <span className="flex flex-col items-start gap-0.5 min-w-0">
        <strong className="text-sm font-bold text-gray-800">{title}</strong>
        <span className="text-[11px] text-text-muted leading-snug">{subtitle}</span>
      </span>
      <ChevronLeft className="w-4 h-4 text-secondary group-hover:translate-x-[-2px] rtl:rotate-180 transition-transform shrink-0" />
    </button>
  )
}
