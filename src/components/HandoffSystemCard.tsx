import { Check } from 'lucide-react'

interface HandoffSystemCardProps {
  variant: 'handoff-complete' | 'waiting'
}

export function HandoffSystemCard({
  variant,
}: HandoffSystemCardProps) {
  if (variant === 'handoff-complete') {
    return (
      <div className="flex items-start mb-3 animate-chat-fade-up">
        <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
          <Check className="w-4 h-4" />
        </div>
        <div className="mx-2 flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-green-600 block">تم تسليم المحادثة</span>
          <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%] mt-1">
            <h2 className="font-semibold mb-1">تم تحويل طلبك</h2>
            <p className="mb-2">تم توصيل المحادثة بفريق استثماركوم بنجاح.</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/80 mb-2">
              <span>✓ الخدمة محفوظة</span>
              <span>✓ بياناتك محفوظة</span>
              <span>✓ لا حاجة لإعادة الشرح</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70 bg-white/10 rounded-lg px-2.5 py-1.5 mt-1">
              <span aria-hidden="true">↳</span>
              <span>سيكمل المختص معك هنا من نفس النقطة.</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start mb-3 animate-chat-fade-up">
      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
        ◷
      </div>
      <div className="mx-2 flex-1 min-w-0">
        <span className="text-[10px] font-semibold text-secondary block">الطلب لدى الفريق</span>
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%] mt-1">
          <h2 className="font-semibold mb-1">بانتظار المختص</h2>
          <p className="mb-2">طلبك محفوظ ويمكنك إضافة أي ملاحظة أثناء الانتظار.</p>
          <div className="flex items-center gap-1.5 text-[11px] text-white/70 bg-white/10 rounded-lg px-2.5 py-1.5 mt-1">
            <span aria-hidden="true">✦</span>
            <span>سنبقيك في نفس المحادثة حتى يبدأ المختص بالرد.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
