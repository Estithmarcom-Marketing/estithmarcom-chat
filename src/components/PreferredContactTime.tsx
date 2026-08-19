import { useState } from 'react'
import { Send, Check } from 'lucide-react'

interface PreferredContactTimeProps {
  onSubmit?: (preferredTime: string) => void
}

const quickOptions = [
  { value: 'خلال اليوم', title: 'خلال اليوم', hint: 'يتواصل معك الفريق في أقرب فرصة متاحة', icon: '☀' },
  { value: 'مساءً', title: 'مساءً', hint: 'يفضل التواصل معك خلال الفترة المسائية', icon: '☾' },
  { value: 'غدًا', title: 'غدًا', hint: 'يفضل التواصل معك خلال يوم غد', icon: '↗' },
] as const

export function PreferredContactTime({ onSubmit }: PreferredContactTimeProps) {
  const [customMode, setCustomMode] = useState(false)
  const [customTime, setCustomTime] = useState('')
  const cleanCustomTime = customTime.trim()

  return (
    <div className="mb-3 animate-chat-fade-up">
      <div className="flex items-start gap-2.5 mb-2 px-4 py-3 bg-gray-50 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">◷</div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-secondary block">تعذر توصيلك بالمختص الآن</span>
          <strong className="text-sm font-bold text-gray-800 block mt-0.5">المستشار المختص مشغول في الوقت الحالي</strong>
          <p className="text-[11px] text-text-muted mt-0.5">استلمنا طلبك، وسيتم التواصل معك من المستشار المختص. اختر الوقت الأنسب لك.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-green-600 mb-2 px-4">
        <span>✓ الخدمة محددة</span>
        <span>✓ طلبك محفوظ</span>
        <span>✓ لن تحتاج لإعادة الشرح</span>
      </div>

      <div className="mb-2 px-4">
        <span className="text-[10px] font-semibold text-text-muted block mb-0.5">تحديد وقت التواصل</span>
        <strong className="text-sm font-bold text-gray-800">متى تحب أن يتواصل معك المستشار المختص؟</strong>
      </div>

      <div className="flex flex-col gap-1.5 px-4 mb-2">
        {quickOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="w-full text-start px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors text-sm font-medium text-gray-800 flex items-center justify-between group cursor-pointer"
            onClick={() => onSubmit?.(option.value)}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-xs text-secondary shrink-0">{option.icon}</span>
              <span className="flex flex-col items-start gap-0.5">
                <strong className="text-sm font-bold text-gray-800">{option.title}</strong>
                <span className="text-[10px] text-text-muted leading-snug">{option.hint}</span>
              </span>
            </span>
          </button>
        ))}

        <button
          type="button"
          className="w-full text-start px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors text-sm font-medium text-gray-800 flex items-center justify-between group cursor-pointer"
          onClick={() => setCustomMode((c) => !c)}
        >
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-xs text-secondary shrink-0">◴</span>
            <span className="flex flex-col items-start gap-0.5">
              <strong className="text-sm font-bold text-gray-800">تحديد وقت</strong>
              <span className="text-[10px] text-text-muted leading-snug">اكتب الوقت الذي يناسبك</span>
            </span>
          </span>
        </button>
      </div>

      {customMode && (
        <form className="flex items-center gap-2 px-4 mb-2 animate-slide-down" onSubmit={(e) => { e.preventDefault(); if (cleanCustomTime) onSubmit?.(cleanCustomTime) }}>
          <input
            type="text"
            value={customTime}
            onChange={(event) => setCustomTime(event.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            placeholder="مثال: اليوم الساعة 5 مساءً"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={!cleanCustomTime}
            className="h-10 px-4 rounded-full bg-secondary disabled:bg-gray-300 text-white flex items-center gap-1.5 shrink-0 transition-colors text-sm font-medium"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="flex items-start gap-2 mx-4 px-3 py-2.5 bg-gray-50 rounded-xl text-[11px] text-text-muted leading-relaxed">
        <span aria-hidden="true">ℹ</span>
        <span>سنحفظ الوقت الذي تفضله للتواصل، وهو ليس موعدًا مؤكدًا حتى يؤكده المستشار المختص.</span>
      </div>
    </div>
  )
}
