import { useEffect, useState } from 'react'

import type { CSSProperties } from 'react'
import { getCategoryById, getGroupsByCategory } from '../catalog/catalog-selectors'
import { Breadcrumb, PlatformCard, TypingIndicator } from './index'

interface PlatformScreenProps {
  categoryId: string
  skipConversationalReveal?: boolean
  onBackHome?: () => void
  onSelectPlatform?: (platformId: string) => void
}

function getConversationPrompt(categoryId: string, categoryTitle: string) {
  if (categoryId === 'company-formation') {
    return { eyebrow: 'خلّيني أساعدك في التأسيس', title: 'ما نوع النشاط أو الشركة التي ترغب في تأسيسها؟', message: 'اختر النوع الأقرب لطلبك، وإذا لم تكن متأكدًا يمكنك كتابة ما تحتاجه في المحادثة وسأساعدك في الوصول للمسار المناسب.' }
  }
  if (categoryId === 'government-services') {
    return { eyebrow: 'أكيد، أقدر أساعدك', title: 'أي منصة أو مجال حكومي تحتاج الخدمة من خلاله؟', message: 'اختر المنصة الأقرب لطلبك، ويمكنك أيضًا وصف احتياجك بطريقتك في المحادثة.' }
  }
  if (categoryId === 'premium-residency') {
    return { eyebrow: 'ممتاز، نكمل معًا', title: 'أي مسار من الإقامة المميزة أقرب لطلبك؟', message: 'اختر الخيار المناسب، وإذا لم تكن تعرف أيها الأنسب اكتب لي ما تبحث عنه وسأساعدك.' }
  }
  return { eyebrow: `نكمل في ${categoryTitle}`, title: 'أي خيار أقرب لما تحتاجه؟', message: 'اختر أحد الخيارات المتاحة أو اكتب طلبك بطريقتك في المحادثة.' }
}

export function PlatformScreen({
  categoryId,
  skipConversationalReveal = false,
  onBackHome,
  onSelectPlatform,
}: PlatformScreenProps) {
  const [promptReady, setPromptReady] = useState(skipConversationalReveal)
  const [optionsTyping, setOptionsTyping] = useState(false)
  const [optionsReady, setOptionsReady] = useState(skipConversationalReveal)

  useEffect(() => {
    if (skipConversationalReveal) {
      setPromptReady(true)
      setOptionsTyping(false)
      setOptionsReady(true)
      return
    }
    setPromptReady(false)
    setOptionsTyping(false)
    setOptionsReady(false)
    const t1 = window.setTimeout(() => setPromptReady(true), 1800)
    const t2 = window.setTimeout(() => setOptionsTyping(true), 3200)
    const t3 = window.setTimeout(() => { setOptionsTyping(false); setOptionsReady(true) }, 5000)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3) }
  }, [categoryId, skipConversationalReveal])

  const category = getCategoryById(categoryId)
  const groups = getGroupsByCategory(categoryId)
  if (!category) return null

  const prompt = getConversationPrompt(category.id, category.title)

  return (
    <section className="animate-chat-fade-in">
      <Breadcrumb
        items={[{ id: 'home', label: 'الرئيسية' }, { id: category.id, label: category.title, current: true }]}
        onNavigate={(id) => { if (id === 'home') onBackHome?.() }}
      />

      {!promptReady && <TypingIndicator actor="assistant" />}

      {promptReady && (
        <div className="flex items-start gap-2.5 px-4 py-3 mb-2 animate-hero-reveal">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
            <span aria-hidden="true">{category.icon}</span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-semibold text-secondary">{prompt.eyebrow}</span>
            <h2 className="text-sm font-bold text-gray-800 leading-snug">{prompt.title}</h2>
            <p className="text-xs text-text-muted leading-relaxed">{prompt.message}</p>
          </div>
        </div>
      )}

      {promptReady && optionsTyping && <TypingIndicator actor="assistant" />}

      {optionsReady && (
        <>
          <div className="px-4 py-1.5">
            <strong className="text-xs font-bold text-text-muted">اختر النوع الأقرب لطلبك</strong>
          </div>
          <div className="flex flex-col gap-1.5 px-4 pb-3">
            {groups.map((group, index) => (
              <PlatformCard
                key={group.id}
                icon={group.icon}
                title={group.title}
                style={{ animationDelay: `${index * 50}ms` } as CSSProperties}
                onSelect={() => onSelectPlatform?.(group.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
