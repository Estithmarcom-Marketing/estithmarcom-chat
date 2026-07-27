import {
  useMemo,
  useState,
} from 'react'

import {
  ServiceCard,
} from './index'

interface CatalogSearchProps {
  items: Array<{
    id: string
    title: string
  }>
  onSelect?: (id: string) => void
}

export function CatalogSearch({
  items,
  onSelect,
}: CatalogSearchProps) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const normalizedQuery =
    query.trim().toLocaleLowerCase('ar')

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return showAll
        ? items
        : items.slice(0, 5)
    }

    return items.filter((item) =>
      item.title
        .toLocaleLowerCase('ar')
        .includes(normalizedQuery),
    )
  }, [
    items,
    normalizedQuery,
    showAll,
  ])

  return (
    <div className="catalog-search premium-catalog-search">
      <label className="premium-catalog-search__field">
        <span
          className="premium-catalog-search__icon"
          aria-hidden="true"
        >
         ⌕
        </span>

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="ابحث عن الخدمة المطلوبة..."
          aria-label="البحث داخل الخدمات"
        />

        {query && (
          <button
            type="button"
            className="premium-catalog-search__clear"
            onClick={() => setQuery('')}
            aria-label="مسح البحث"
          >
            ×
          </button>
        )}
      </label>

      <div className="premium-catalog-search__meta">
        <span>
          {normalizedQuery
            ? `نتائج البحث (${filteredItems.length})`
            : 'الخدمات المتاحة'}
        </span>

        <span>
          {items.length} خدمات
        </span>
      </div>

      <div className="catalog-search__results premium-service-results">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ServiceCard
              key={item.id}
              title={item.title}
              onSelect={() =>
                onSelect?.(item.id)
              }
            />
          ))
        ) : (
          <div className="premium-catalog-search__empty">
            <span
              className="premium-catalog-search__empty-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <strong>
              لم نجد خدمة بهذا الاسم
            </strong>

            <p>
              جرّب كتابة اسم الخدمة بطريقة أخرى.
            </p>

            <button
              type="button"
              onClick={() => setQuery('')}
            >
              عرض جميع الخدمات
            </button>
          </div>
        )}
      </div>

      {!query &&
        items.length > 5 && (
          <button
            type="button"
            className="catalog-search__toggle premium-catalog-search__toggle"
            onClick={() =>
              setShowAll((current) =>
                !current
              )
            }
          >
            <span>
              {showAll
                ? 'عرض أقل'
                : 'عرض جميع الخدمات'}
            </span>

            <span aria-hidden="true">
              {showAll ? '⌃' : '⌄'}
            </span>
          </button>
        )}
    </div>
  )
}
