import {
  getCategoryById,
  getGroupsByCategory,
} from '../catalog/catalog-selectors'

import {
  Breadcrumb,
  PlatformCard,
} from './index'

interface PlatformScreenProps {
  categoryId: string
  onBackHome?: () => void
  onSelectPlatform?: (
    platformId: string,
  ) => void
}

export function PlatformScreen({
  categoryId,
  onBackHome,
  onSelectPlatform,
}: PlatformScreenProps) {
  const category =
    getCategoryById(categoryId)

  const groups =
    getGroupsByCategory(
      categoryId,
    )

  if (!category) {
    return null
  }

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

      <header className="premium-platform-screen__hero">
        <div className="premium-platform-screen__hero-icon">
          <span aria-hidden="true">
            {category.icon}
          </span>
        </div>

        <div className="premium-platform-screen__hero-content">
          <span className="premium-platform-screen__eyebrow">
            {category.title}
          </span>

          <h2>
            اختر المسار المناسب
          </h2>

          <p>
            اختر المسار وسنعرض لك الخدمات المتاحة بخطوات واضحة.
          </p>
        </div>
      </header>

      <div className="premium-platform-screen__section-heading">
        <div>
          <span>
            الخيارات المتاحة
          </span>

          <strong>
            اختر للمتابعة
          </strong>
        </div>

        <span className="premium-platform-screen__count">
          {groups.length} خيارات
        </span>
      </div>

      <div className="platform-screen__grid premium-platform-grid">
        {groups.map(
          (group) => (
            <PlatformCard
              key={group.id}
              icon={group.icon}
              title={group.title}
              onSelect={() =>
                onSelectPlatform?.(
                  group.id,
                )
              }
            />
          ),
        )}
      </div>
    </section>
  )
}
