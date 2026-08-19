import { User } from 'lucide-react'

interface SpecialistButtonProps {
  onClick?: () => void
}

export function SpecialistButton({
  onClick,
}: SpecialistButtonProps) {
  return (
    <div className="px-4 py-3">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-secondary" />
        </div>
        <span className="flex-1 min-w-0 text-right">
          <span className="text-[10px] font-semibold text-text-muted block">تحتاج مساعدة مباشرة؟</span>
          <strong className="text-sm font-bold text-gray-800">تحدث مع مختص</strong>
          <span className="text-[10px] text-text-soft block">نوصل طلبك لفريق استثماركوم</span>
        </span>
      </button>
    </div>
  )
}
