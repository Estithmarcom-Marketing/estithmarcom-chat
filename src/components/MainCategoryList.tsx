import type {
  CSSProperties,
} from 'react'

import {
  MainCategoryCard,
} from './MainCategoryCard'

interface MainCategoryListProps {
  onSelectCategory?: (
    categoryId: string,
  ) => void
}

const categories = [
  {
    id: 'company-formation',
    icon: '🏢',
    title: 'تأسيس الشركات',
    subtitle: 'ابدأ شركتك بخطوات واضحة ومنظمة',
  },
  {
    id: 'government-services',
    icon: '🏛️',
    title: 'الخدمات الحكومية',
    subtitle: 'قوى • بلدي • مقيم • ZATCA والمزيد',
  },
  {
    id: 'premium-residency',
    icon: '⭐',
    title: 'الإقامة المميزة',
    subtitle: 'استعرض الخيارات وحدد المسار المناسب',
  },
] as const

export function MainCategoryList({
  onSelectCategory,
}: MainCategoryListProps) {
  return (
    <section
      className="main-category-list premium-category-list"
      aria-label="الأقسام الرئيسية"
    >
      <div className="premium-category-list__heading">
        <div>
          <span className="premium-category-list__eyebrow">
            ابدأ من هنا
          </span>

          <h2>
            اختر ما تحتاجه
          </h2>
        </div>

        <span
          className="premium-category-list__badge"
          aria-hidden="true"
        >
          3 مسارات
        </span>
      </div>

      <div className="main-category-list__items">
        {categories.map(
          (category, index) => (
            <div
              key={category.id}
              className="premium-category-card-wrap"
              style={{
                '--category-index':
                  index,
              } as CSSProperties}
            >
              <MainCategoryCard
                icon={category.icon}
                title={category.title}
                subtitle={category.subtitle}
                onSelect={() =>
                  onSelectCategory?.(
                    category.id,
                  )
                }
              />
            </div>
          ),
        )}
      </div>
    </section>
  )
}

