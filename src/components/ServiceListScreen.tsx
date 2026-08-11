import {
  useEffect,
  useState,
} from 'react'

import {
  getCategoryById,
  getGroupById,
  getServicesByGroup,
} from '../catalog/catalog-selectors'

import {
  Breadcrumb,
} from './Breadcrumb'

import {
  CatalogSearch,
} from './CatalogSearch'

import {
  TypingIndicator,
} from './TypingIndicator'

interface ServiceListScreenProps {
  categoryId: string
  groupId: string
  onHome?: () => void
  onBackToPlatforms?: () => void
  onSelectService?: (
    serviceId: string,
  ) => void
}

export function ServiceListScreen({
  categoryId,
  groupId,
  onHome,
  onBackToPlatforms,
  onSelectService,
}: ServiceListScreenProps) {
  const category =
    getCategoryById(
      categoryId,
    )

  const group =
    getGroupById(
      groupId,
    )

  const services =
    getServicesByGroup(
      groupId,
    )

  const isCompanyFormation =
    categoryId ===
    'company-formation'

  const [
    questionReady,
    setQuestionReady,
  ] = useState(
    !isCompanyFormation,
  )

  const [
    servicesTyping,
    setServicesTyping,
  ] = useState(false)

  const [
    servicesReady,
    setServicesReady,
  ] = useState(
    !isCompanyFormation,
  )

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

    const questionTimer =
      window.setTimeout(
        () => {
          setQuestionReady(true)
        },
        1800,
      )

    const servicesTypingTimer =
      window.setTimeout(
        () => {
          setServicesTyping(true)
        },
        3200,
      )

    const servicesReadyTimer =
      window.setTimeout(
        () => {
          setServicesTyping(false)
          setServicesReady(true)
        },
        5000,
      )

    return () => {
      window.clearTimeout(
        questionTimer,
      )

      window.clearTimeout(
        servicesTypingTimer,
      )

      window.clearTimeout(
        servicesReadyTimer,
      )
    }
  }, [
    categoryId,
    groupId,
    isCompanyFormation,
  ])

  if (
    !category ||
    !group
  ) {
    return null
  }

  return (
    <section className="service-list-screen premium-service-list">
      <Breadcrumb
        items={[
          {
            id: 'home',
            label: 'الرئيسية',
          },
          {
            id: category.id,
            label: category.title,
          },
          {
            id: group.id,
            label: group.title,
            current: true,
          },
        ]}
        onNavigate={(id) => {
          if (id === 'home') {
            onHome?.()
          }

          if (
            id ===
            category.id
          ) {
            onBackToPlatforms?.()
          }
        }}
      />

      {isCompanyFormation &&
        !questionReady && (
          <TypingIndicator
            actor="assistant"
          />
        )}

      {questionReady && (
        <header
          className={
            isCompanyFormation
              ? 'premium-service-list__hero premium-service-list__hero--company-formation'
              : 'premium-service-list__hero'
          }
        >
          {!isCompanyFormation && (
            <div
              className="premium-service-list__icon"
              aria-hidden="true"
            >
              {group.icon}
            </div>
          )}

          <div>
            <span className="premium-service-list__eyebrow">
              ممتاز 👍 نكمل معك في هذا المسار
            </span>

            <h2>
              ما الخدمة التي تحتاجها تحديدًا؟
            </h2>

            <p>
              اختر الخدمة الأقرب لطلبك من الخيارات المتاحة، أو اكتب لي ما تحتاجه بطريقتك.
            </p>
          </div>
        </header>
      )}

      {isCompanyFormation &&
        questionReady &&
        servicesTyping && (
          <TypingIndicator
            actor="assistant"
          />
        )}

      {servicesReady && (
        isCompanyFormation ? (
          <div
            className="company-formation-service-list"
            aria-label="الخدمات المتاحة"
          >
            <div className="company-formation-service-list__heading">
              <strong>
                الخدمات المتاحة
              </strong>

              <span>
                {services.length} خدمات
              </span>
            </div>

            <div className="company-formation-service-list__items">
              {services.map(
                (service) => (
                  <button
                    key={service.id}
                    type="button"
                    className="company-formation-service-option"
                    onClick={() =>
                      onSelectService?.(
                        service.id,
                      )
                    }
                  >
                    <span className="company-formation-service-option__title">
                      {service.title}
                    </span>

                    <span
                      className="company-formation-service-option__arrow"
                      aria-hidden="true"
                    >
                      ‹
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        ) : (
          <CatalogSearch
            items={services.map(
              (service) => ({
                id: service.id,
                title: service.title,
              }),
            )}
            onSelect={
              onSelectService
            }
          />
        )
      )}
    </section>
  )
}
