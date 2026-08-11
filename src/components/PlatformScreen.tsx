import {
  type CSSProperties,
  useEffect,
  useState,
} from 'react'

import {
  getCategoryById,
  getGroupsByCategory,
} from '../catalog/catalog-selectors'

import {
  Breadcrumb,
  PlatformCard,
  TypingIndicator,
} from './index'

interface PlatformScreenProps {
  categoryId: string
  skipConversationalReveal?: boolean
  onBackHome?: () => void
  onSelectPlatform?: (
    platformId: string,
  ) => void
}

interface ConversationPrompt {
  eyebrow: string
  title: string
  message: string
}

function getConversationPrompt(
  categoryId: string,
  categoryTitle: string,
): ConversationPrompt {
  if (
    categoryId ===
    'company-formation'
  ) {
    return {
      eyebrow:
        'خلّيني أساعدك في التأسيس',

      title:
        'ما نوع النشاط أو الشركة التي ترغب في تأسيسها؟',

      message:
        'اختر النوع الأقرب لطلبك، وإذا لم تكن متأكدًا يمكنك كتابة ما تحتاجه في المحادثة وسأساعدك في الوصول للمسار المناسب.',
    }
  }

  if (
    categoryId ===
    'government-services'
  ) {
    return {
      eyebrow:
        'أكيد، أقدر أساعدك',

      title:
        'أي منصة أو مجال حكومي تحتاج الخدمة من خلاله؟',

      message:
        'اختر المنصة الأقرب لطلبك، ويمكنك أيضًا وصف احتياجك بطريقتك في المحادثة.',
    }
  }

  if (
    categoryId ===
    'premium-residency'
  ) {
    return {
      eyebrow:
        'ممتاز، نكمل معًا',

      title:
        'أي مسار من الإقامة المميزة أقرب لطلبك؟',

      message:
        'اختر الخيار المناسب، وإذا لم تكن تعرف أيها الأنسب اكتب لي ما تبحث عنه وسأساعدك.',
    }
  }

  return {
    eyebrow:
      `نكمل في ${categoryTitle}`,

    title:
      'أي خيار أقرب لما تحتاجه؟',

    message:
      'اختر أحد الخيارات المتاحة أو اكتب طلبك بطريقتك في المحادثة.',
  }
}

export function PlatformScreen({
  categoryId,
  skipConversationalReveal = false,
  onBackHome,
  onSelectPlatform,
}: PlatformScreenProps) {
  const isCompanyFormation =
    categoryId ===
    'company-formation'

  const [
    companyPromptReady,
    setCompanyPromptReady,
  ] = useState(
    skipConversationalReveal,
  )

  const [
    companyOptionsTyping,
    setCompanyOptionsTyping,
  ] = useState(false)

  const [
    companyOptionsReady,
    setCompanyOptionsReady,
  ] = useState(
    skipConversationalReveal,
  )

  useEffect(() => {
    if (skipConversationalReveal) {
      setCompanyPromptReady(true)
      setCompanyOptionsTyping(false)
      setCompanyOptionsReady(true)

      return
    }

    setCompanyPromptReady(false)
    setCompanyOptionsTyping(false)
    setCompanyOptionsReady(false)

    /*
     * Same deliberate conversational rhythm
     * approved for the welcome sequence.
     *
     * 0–1800ms:
     * assistant is preparing the question
     *
     * 1800ms:
     * question appears
     *
     * 3200ms:
     * assistant starts preparing suggestions
     *
     * 5000ms:
     * existing catalog choices appear
     */
    const promptTimer =
      window.setTimeout(
        () => {
          setCompanyPromptReady(true)
        },
        1800,
      )

    const optionsTypingTimer =
      window.setTimeout(
        () => {
          setCompanyOptionsTyping(true)
        },
        3200,
      )

    const optionsReadyTimer =
      window.setTimeout(
        () => {
          setCompanyOptionsTyping(false)
          setCompanyOptionsReady(true)
        },
        5000,
      )

    return () => {
      window.clearTimeout(
        promptTimer,
      )

      window.clearTimeout(
        optionsTypingTimer,
      )

      window.clearTimeout(
        optionsReadyTimer,
      )
    }
  }, [
    categoryId,
    isCompanyFormation,
    skipConversationalReveal,
  ])

  const category =
    getCategoryById(
      categoryId,
    )

  const groups =
    getGroupsByCategory(
      categoryId,
    )

  if (!category) {
    return null
  }

  const prompt =
    getConversationPrompt(
      category.id,
      category.title,
    )

  return (
    <section className="platform-screen premium-platform-screen">
      <Breadcrumb
        items={[
          {
            id: 'home',
            label: 'الرئيسية',
          },
          {
            id: category.id,
            label: category.title,
            current: true,
          },
        ]}
        onNavigate={(id) => {
          if (id === 'home') {
            onBackHome?.()
          }
        }}
      />

      {!companyPromptReady && (
        <TypingIndicator
          actor="assistant"
        />
      )}

      {companyPromptReady && (
      <header
        className={
          skipConversationalReveal
            ? 'premium-platform-screen__hero platform-return-motion__hero'
            : 'premium-platform-screen__hero'
        }
      >
        <div className="premium-platform-screen__hero-icon">
          <span aria-hidden="true">
            {category.icon}
          </span>
        </div>

        <div className="premium-platform-screen__hero-content">
          <span className="premium-platform-screen__eyebrow">
            {prompt.eyebrow}
          </span>

          <h2>
            {prompt.title}
          </h2>

          <p>
            {prompt.message}
          </p>
        </div>
      </header>
      )}

      {companyPromptReady &&
        companyOptionsTyping && (
          <TypingIndicator
            actor="assistant"
          />
        )}

      {companyOptionsReady && (
        <>
      <div
        className={
          skipConversationalReveal
            ? 'premium-platform-screen__section-heading platform-return-motion__heading'
            : 'premium-platform-screen__section-heading'
        }
      >
        <strong>
          اختر النوع الأقرب لطلبك
        </strong>
      </div>

      <div className="platform-screen__grid premium-platform-grid">
        {groups.map(
          (group, index) => (
            <PlatformCard
              key={group.id}
              icon={group.icon}
              title={group.title}
              className={
                skipConversationalReveal
                  ? 'platform-return-motion__card'
                  : undefined
              }
              style={
                {
                  '--platform-return-index':
                    index,
                } as CSSProperties
              }
              onSelect={() =>
                onSelectPlatform?.(
                  group.id,
                )
              }
            />
          ),
        )}
      </div>
        </>
      )}
    </section>
  )
}
