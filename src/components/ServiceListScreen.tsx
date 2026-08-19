import { useEffect, useState } from 'react'
import { getCategoryById, getGroupById, getServicesByGroup } from '../catalog/catalog-selectors'
import { Breadcrumb } from './Breadcrumb'
import { CatalogSearch } from './CatalogSearch'
import { TypingIndicator } from './TypingIndicator'
import { ChevronLeft } from 'lucide-react'

interface ServiceListScreenProps {
  categoryId: string
  groupId: string
  onHome?: () => void
  onBackToPlatforms?: () => void
  onSelectService?: (serviceId: string) => void
}

export function ServiceListScreen({
  categoryId,
  groupId,
  onHome,
  onBackToPlatforms,
  onSelectService,
}: ServiceListScreenProps) {
  const category = getCategoryById(categoryId)
  const group = getGroupById(groupId)
  const services = getServicesByGroup(groupId)
  const isCompanyFormation = categoryId === 'company-formation'

  const [questionReady, setQuestionReady] = useState(!isCompanyFormation)
  const [servicesTyping, setServicesTyping] = useState(false)
  const [servicesReady, setServicesReady] = useState(!isCompanyFormation)

  useEffect(() => {
    if (!isCompanyFormation) {
      setQuestionReady(true)
      setServicesTyping(false)
      setServicesReady(true)
      return
    }
    setQuestionReady(false)
    setServicesTyping(false)
    setServicesReady(false)
    const t1 = window.setTimeout(() => setQuestionReady(true), 1800)
    const t2 = window.setTimeout(() => setServicesTyping(true), 3200)
    const t3 = window.setTimeout(() => { setServicesTyping(false); setServicesReady(true) }, 5000)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3) }
  }, [categoryId, groupId, isCompanyFormation])

  if (!category || !group) return null

  return (
    <section className="animate-chat-fade-in">
      <Breadcrumb
        items={[
          { id: 'home', label: 'الرئيسية' },
          { id: category.id, label: category.title },
          { id: group.id, label: group.title, current: true },
        ]}
        onNavigate={(id) => {
          if (id === 'home') onHome?.()
          if (id === category.id) onBackToPlatforms?.()
        }}
      />

      {isCompanyFormation && !questionReady && <TypingIndicator actor="assistant" />}

      {questionReady && (
        <div className="flex items-start gap-2.5 px-4 py-3 mb-2 animate-hero-reveal">
          {!isCompanyFormation && (
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5" aria-hidden="true">
              {group.icon}
            </div>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-semibold text-secondary">ممتاز 👍 نكمل معك في هذا المسار</span>
            <h2 className="text-sm font-bold text-gray-800 leading-snug">ما الخدمة التي تحتاجها تحديدًا؟</h2>
            <p className="text-xs text-text-muted leading-relaxed">اختر الخدمة الأقرب لطلبك من الخيارات المتاحة، أو اكتب لي ما تحتاجه بطريقتك.</p>
          </div>
        </div>
      )}

      {isCompanyFormation && questionReady && servicesTyping && <TypingIndicator actor="assistant" />}

      {servicesReady && (
        isCompanyFormation ? (
          <div className="px-4 pb-3 animate-chat-fade-in" aria-label="الخدمات المتاحة">
            <div className="flex items-center justify-between px-1 mb-2">
              <strong className="text-xs font-bold text-text-muted">الخدمات المتاحة</strong>
              <span className="text-[11px] text-text-soft">{services.length} خدمات</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className="w-full text-start px-3.5 py-2.5 rounded-xl border border-secondary/30 bg-white hover:bg-secondary/10 transition-colors text-sm font-medium text-gray-800 flex items-center justify-between group cursor-pointer"
                  onClick={() => onSelectService?.(service.id)}
                >
                  <span className="text-sm font-bold text-gray-800">{service.title}</span>
                  <ChevronLeft className="w-4 h-4 text-secondary group-hover:translate-x-[-2px] rtl:rotate-180 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <CatalogSearch
            items={services.map((s) => ({ id: s.id, title: s.title }))}
            onSelect={onSelectService}
          />
        )
      )}
    </section>
  )
}
