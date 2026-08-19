import { Check } from 'lucide-react'

interface PreferredTimeSavedProps {
  preferredTime: string
}

export function PreferredTimeSaved({
  preferredTime,
}: PreferredTimeSavedProps) {
  return (
    <div className="flex items-start mb-3 animate-chat-fade-up">
      <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
        <Check className="w-4 h-4" />
      </div>
      <div className="mx-2 flex-1 min-w-0">
        <span className="text-[10px] font-semibold text-green-600 block">تم تحديث طلبك</span>
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%] mt-1">
          <h2 className="font-semibold mb-1">تم تسجيل الوقت المفضل</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-white/80 bg-white/10 rounded-lg px-2.5 py-1.5 my-2">
            <span className="text-white/60">الوقت المناسب:</span>
            <strong className="text-white">{preferredTime}</strong>
          </div>
          <p className="mb-1"> أصبح الوقت المفضل محفوظًا لدى فريق استثماركوم.</p>
          <p className="text-[11px] text-white/70">ويمكنك الاستمرار بالكتابة هنا في أي وقت.</p>
        </div>
      </div>
    </div>
  )
}
