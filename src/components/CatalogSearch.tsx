import { Search } from 'lucide-react'
import { useState } from 'react'
import { ServiceCard } from './index'

interface CatalogSearchProps {
  items: Array<{ id: string; title: string }>
  onSelect?: (id: string) => void
}

export function CatalogSearch({
  items,
  onSelect,
}: CatalogSearchProps) {
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const normalizedQuery = query.trim().toLocaleLowerCase('ar')

  const filteredItems = normalizedQuery
    ? items.filter((item) => item.title.toLocaleLowerCase('ar').includes(normalizedQuery))
    : showAll
      ? items
      : items.slice(0, 5)

  return (
    <div className="flex flex-col gap-2 animate-chat-fade-in">
      <div className="relative px-4">
        <Search className="absolute start-7 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full h-10 ps-9 pe-9 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          placeholder="ابحث عن الخدمة المطلوبة..."
          aria-label="البحث داخل الخدمات"
          dir="rtl"
        />
        {query && (
          <button
            type="button"
            className="absolute end-7 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-sm text-text-soft hover:text-gray-800 rounded-full transition-colors"
            onClick={() => setQuery('')}
            aria-label="مسح البحث"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-5 text-[11px] font-semibold text-text-muted">
        <span>{normalizedQuery ? `نتائج البحث (${filteredItems.length})` : 'الخدمات المتاحة'}</span>
        <span>{items.length} خدمات</span>
      </div>

      <div className="flex flex-col gap-1.5 px-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ServiceCard key={item.id} title={item.title} onSelect={() => onSelect?.(item.id)} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Search className="w-8 h-8 text-text-soft" />
            <strong className="text-sm font-bold text-gray-800">لم نجد خدمة بهذا الاسم</strong>
            <p className="text-xs text-text-muted">جرّب كتابة اسم الخدمة بطريقة أخرى.</p>
            <button
              type="button"
              className="mt-1 px-3 py-1.5 text-xs font-bold text-secondary border border-secondary/30 bg-white rounded-xl hover:bg-secondary/10 transition-colors cursor-pointer"
              onClick={() => setQuery('')}
            >
              عرض جميع الخدمات
            </button>
          </div>
        )}
      </div>

      {!query && items.length > 5 && (
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-text-muted hover:text-gray-800 transition-colors"
          onClick={() => setShowAll((c) => !c)}
        >
          <span>{showAll ? 'عرض أقل' : 'عرض جميع الخدمات'}</span>
          <span aria-hidden="true">{showAll ? '⌃' : '⌄'}</span>
        </button>
      )}
    </div>
  )
}
