import { Check, User, ChevronLeft } from 'lucide-react'
import { Breadcrumb } from './Breadcrumb'

interface ServiceConfirmationScreenProps {
  serviceName: string
  groupName: string
  onHome?: () => void
  onBackToServices?: () => void
  onRequestSpecialist?: () => void
}

export function ServiceConfirmationScreen({
  serviceName,
  groupName,
  onHome,
  onBackToServices,
  onRequestSpecialist,
}: ServiceConfirmationScreenProps) {
  return (
    <section className="animate-chat-fade-in">
      <Breadcrumb
        items={[
          { id: 'home', label: 'الرئيسية' },
          { id: 'services', label: groupName },
          { id: 'selected', label: serviceName, current: true },
        ]}
        onNavigate={(id) => {
          if (id === 'home') onHome?.()
          if (id === 'services') onBackToServices?.()
        }}
      />

      <div className="flex items-start gap-2.5 px-4 py-3 mb-2 animate-hero-reveal">
        <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
          <Check className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] font-semibold text-green-600">ممتاز، فهمت طلبك 👍</span>
          <h2 className="text-sm font-bold text-gray-800 leading-snug">{serviceName}</h2>
          <p className="text-xs text-text-muted">ضمن مسار «{groupName}»</p>
        </div>
      </div>

      <div className="mx-4 p-3.5 bg-gray-50 rounded-xl mb-3 animate-chat-fade-up">
        <div className="mb-3">
          <span className="text-[10px] font-semibold text-text-muted block mb-0.5">الخطوة التالية</span>
          <strong className="text-sm font-bold text-gray-800">أوصلك للمختص المناسب</strong>
        </div>

        <div className="flex flex-col gap-2.5">
          {[
            { num: '1', title: 'الخدمة أصبحت واضحة', desc: 'حفظت اختيارك حتى لا تحتاج لإعادة شرح طلبك للموظف.' },
            { num: '2', title: 'أحتاج فقط بيانات التواصل الناقصة', desc: 'سنطلب الاسم ورقم الجوال فقط إذا لم يكونا موجودين لدينا.' },
            { num: '3', title: 'نكمل من نفس النقطة', desc: 'بعد اكتمال البيانات، أحولك مباشرة للمختص ليكمل معك من هنا.' },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 text-[10px] font-bold bg-secondary/10 text-secondary rounded-full shrink-0">{step.num}</span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <strong className="text-xs font-bold text-gray-800">{step.title}</strong>
                <p className="text-[11px] text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 mx-4 mb-3 px-3 py-2.5 bg-secondary/5 border border-secondary/15 rounded-xl text-[11px] text-text-muted leading-relaxed">
        <span className="text-secondary shrink-0">✦</span>
        <p>لن نكرر عليك المعلومات الموجودة، وسنطلب فقط ما نحتاجه لإكمال التحويل.</p>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-3">
        <button
          type="button"
          className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          onClick={onRequestSpecialist}
        >
          <User className="w-4 h-4" />
          <span>متابعة مع المختص</span>
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <button
          type="button"
          className="w-full py-2.5 text-sm font-bold text-secondary border border-secondary/30 bg-white rounded-xl transition-colors hover:bg-secondary/10 cursor-pointer"
          onClick={onBackToServices}
        >
          اختيار خدمة أخرى
        </button>
      </div>
    </section>
  )
}
