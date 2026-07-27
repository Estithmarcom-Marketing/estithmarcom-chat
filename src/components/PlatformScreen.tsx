import {
  Breadcrumb,
  PlatformCard,
} from './index'

const mockGovernmentPlatforms = [
  {
    id: 'qiwa',
    title: 'قوى',
    icon: '🏢',
  },
  {
    id: 'commerce',
    title: 'وزارة التجارة',
    icon: '🏛️',
  },
  {
    id: 'balady',
    title: 'بلدي',
    icon: '🏙️',
  },
  {
    id: 'muqeem',
    title: 'مقيم',
    icon: '🪪',
  },
  {
    id: 'zatca',
    title: 'ZATCA',
    icon: '🧾',
  },
  {
    id: 'mudad',
    title: 'مدد',
    icon: '📋',
  },
  {
    id: 'national-address',
    title: 'العنوان الوطني',
    icon: '📍',
  },
  {
    id: 'chamber',
    title: 'الغرفة التجارية',
    icon: '🏛️',
  },
] as const

interface PlatformScreenProps {
  onBackHome?: () => void
  onSelectPlatform?: (
    platformId: string,
  ) => void
}

export function PlatformScreen({
  onBackHome,
  onSelectPlatform,
}: PlatformScreenProps) {
  return (
    <section className="platform-screen premium-platform-screen">
      <Breadcrumb
        items={[
          {
            id: 'home',
            label: 'الرئيسية',
          },
          {
            id: 'government',
            label: 'الخدمات الحكومية',
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
            🏛️
          </span>
        </div>

        <div className="premium-platform-screen__hero-content">
          <span className="premium-platform-screen__eyebrow">
            الخدمات الحكومية
          </span>

          <h2>
            اختر الجهة المناسبة
          </h2>

          <p>
            اختر المنصة الحكومية وسنعرض لك الخدمات المتاحة بخطوات واضحة.
          </p>
        </div>
      </header>

      <div className="premium-platform-screen__section-heading">
        <div>
          <span>
            الجهات المتاحة
          </span>

          <strong>
            اختر منصة للمتابعة
          </strong>
        </div>

        <span className="premium-platform-screen__count">
          {mockGovernmentPlatforms.length} جهات
        </span>
      </div>

      <div className="platform-screen__grid premium-platform-grid">
        {mockGovernmentPlatforms.map(
          (platform) => (
            <PlatformCard
              key={platform.id}
              icon={platform.icon}
              title={platform.title}
              onSelect={() =>
                onSelectPlatform?.(
                  platform.id,
                )
              }
            />
          ),
        )}
      </div>
    </section>
  )
}
