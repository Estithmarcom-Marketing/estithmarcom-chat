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

      <header className="premium-service-list__hero">
        <div
          className="premium-service-list__icon"
          aria-hidden="true"
        >
          {group.icon}
        </div>

        <div>
          <span className="premium-service-list__eyebrow">
            {group.title}
          </span>

          <h2>
            اختر الخدمة المطلوبة
          </h2>

          <p>
            ابحث أو اختر إحدى الخدمات المتاحة للمتابعة.
          </p>
        </div>
      </header>

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
    </section>
  )
}