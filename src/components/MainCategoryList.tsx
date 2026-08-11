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
      <div className="smart-suggestions__prompt">
        <span
          className="smart-suggestions__spark"
          aria-hidden="true"
        >
          ✦
        </span>

        <div>
          <strong>
            كيف نقدر نخدمك اليوم؟
          </strong>

          <span>
            اختر المجال الأقرب لطلبك، أو اكتب لي ما تحتاجه بطريقتك.
          </span>
        </div>
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