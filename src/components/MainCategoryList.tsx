import type { CSSProperties } from 'react'
import { getCatalogCategories } from '../catalog/catalog-selectors'
import { MainCategoryCard } from './MainCategoryCard'

interface MainCategoryListProps {
  onSelectCategory?: (categoryId: string) => void
}

export function MainCategoryList({
  onSelectCategory,
}: MainCategoryListProps) {
  const categories = getCatalogCategories()

  return (
    <section className="animate-chat-fade-in" aria-label="الأقسام الرئيسية">
      <div className="flex items-start gap-2.5 mb-3 px-3.5">
        <span className="text-sm text-secondary shrink-0 mt-0.5">✦</span>
        <div className="flex flex-col gap-0.5">
          <strong className="text-sm font-bold text-gray-800">كيف نقدر نخدمك اليوم؟</strong>
          <span className="text-xs text-text-muted leading-relaxed">اختر المجال الأقرب لطلبك، أو اكتب لي ما تحتاجه بطريقتك.</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-4">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="animate-category-reveal"
            style={{ animationDelay: `${index * 60}ms` } as CSSProperties}
          >
            <MainCategoryCard
              title={category.title}
              subtitle={category.subtitle}
              onSelect={() => onSelectCategory?.(category.id)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
