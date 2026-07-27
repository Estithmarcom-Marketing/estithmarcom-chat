import type {
  CSSProperties,
} from 'react'

import {
  getCatalogCategories,
} from '../catalog/catalog-selectors'

import {
  MainCategoryCard,
} from './MainCategoryCard'

interface MainCategoryListProps {
  onSelectCategory?: (
    categoryId: string,
  ) => void
}

export function MainCategoryList({
  onSelectCategory,
}: MainCategoryListProps) {
  const categories =
    getCatalogCategories()

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
          {categories.length} مسارات
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