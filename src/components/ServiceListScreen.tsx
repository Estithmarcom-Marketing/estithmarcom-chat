import {
  Breadcrumb,
  CatalogSearch,
} from './index'

const mockMuqeemServices = [
  {
    id: 'issue-residency',
    title: 'إصدار إقامة',
  },
  {
    id: 'renew-residency',
    title: 'تجديد إقامة',
  },
  {
    id: 'exit-reentry',
    title: 'تأشيرة خروج وعودة',
  },
  {
    id: 'final-exit',
    title: 'خروج نهائي',
  },
] as const

interface ServiceListScreenProps {
  onHome?: () => void
  onBackToPlatforms?: () => void
  onSelectService?: (
    serviceId: string,
  ) => void
}

export function ServiceListScreen({
  onHome,
  onBackToPlatforms,
  onSelectService,
}: ServiceListScreenProps) {
  return (
    <section className="service-list-screen premium-service-list">
      <Breadcrumb
        items={[
          {
            id: 'home',
            label: 'الرئيسية',
          },
          {
            id: 'government',
            label: 'الخدمات الحكومية',
          },
          {
            id: 'muqeem',
            label: 'مقيم',
            current: true,
          },
        ]}
        onNavigate={(id) => {
          if (id === 'home') {
            onHome?.()
          }

          if (id === 'government') {
            onBackToPlatforms?.()
          }
        }}
      />

      <header className="premium-service-list__hero">
        <div
          className="premium-service-list__icon"
          aria-hidden="true"
        >
          🪪
        </div>

        <div>
          <span className="premium-service-list__eyebrow">
            منصة مقيم
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
        items={[...mockMuqeemServices]}
        onSelect={onSelectService}
      />
    </section>
  )
}
