import { Check } from 'lucide-react'

import type {
  CustomerContact,
  SelectedServiceContext,
} from '../types'

interface HandoffSystemCardProps {
  variant: 'handoff-complete' | 'waiting'
  contact?: CustomerContact
  service?: SelectedServiceContext
}

export function HandoffSystemCard({
  variant,
  contact,
  service,
}: HandoffSystemCardProps) {
  const isComplete =
    variant === 'handoff-complete'

  const summaryItems = [
    {
      label: 'الخدمة',
      value:
        service?.serviceName?.trim() ||
        service?.platformName?.trim(),
    },
    {
      label: 'القسم',
      value:
        service?.categoryName?.trim(),
    },
    {
      label: 'الاسم',
      value:
        contact?.name?.trim(),
    },
    {
      label: 'الجوال',
      value:
        contact?.phone?.trim(),
    },
  ].filter((item) => Boolean(item.value))

  return (
    <div className="flex items-start mb-3 animate-chat-fade-up">
      <div
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center',
          'shrink-0 mt-0.5',
          isComplete
            ? 'bg-green-100 text-green-600'
            : 'bg-primary text-white text-[10px] font-bold',
        ].join(' ')}
      >
        {isComplete ? (
          <Check className="w-4 h-4" />
        ) : (
          <span aria-hidden="true">◷</span>
        )}
      </div>

      <div className="mx-2 flex-1 min-w-0">
        <span
          className={[
            'text-[10px] font-semibold block',
            isComplete
              ? 'text-green-600'
              : 'text-secondary',
          ].join(' ')}
        >
          {isComplete
            ? 'تم تسليم الطلب'
            : 'الطلب لدى الفريق'}
        </span>

        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white max-w-[88%] mt-1">
          <h2 className="text-sm font-semibold mb-2">
            تم إرسال طلبك للمختص
          </h2>

          {summaryItems.length > 0 && (
            <dl className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 rounded-xl bg-white/10 px-2.5 py-2 mb-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="contents"
                >
                  <dt className="text-[10px] text-white/65">
                    {item.label}
                  </dt>
                  <dd
                    className="text-[11px] font-medium text-white break-words"
                    dir="auto"
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-white/75">
            <span aria-hidden="true">
              {isComplete ? '✓' : '◷'}
            </span>
            <span>
              {isComplete
                ? 'المختص سيكمل معك هنا'
                : 'بانتظار انضمام المختص'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
