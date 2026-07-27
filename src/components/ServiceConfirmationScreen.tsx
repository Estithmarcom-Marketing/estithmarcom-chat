import {
  Breadcrumb,
} from './index'

interface ServiceConfirmationScreenProps {
  serviceName: string
  platformName: string
  onHome?: () => void
  onBackToServices?: () => void
  onRequestSpecialist?: () => void
}

export function ServiceConfirmationScreen({
  serviceName,
  platformName,
  onHome,
  onBackToServices,
  onRequestSpecialist,
}: ServiceConfirmationScreenProps) {
  return (
    <section className="service-confirmation premium-service-confirmation">
      <Breadcrumb
        items={[
          {
            id: 'home',
            label: 'الرئيسية',
          },
          {
            id: 'services',
            label: platformName,
          },
          {
            id: 'selected',
            label: serviceName,
            current: true,
          },
        ]}
        onNavigate={(id) => {
          if (id === 'home') {
            onHome?.()
          }

          if (id === 'services') {
            onBackToServices?.()
          }
        }}
      />

      <div className="premium-service-confirmation__hero">
        <div
          className="premium-service-confirmation__icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <div>
          <span className="premium-service-confirmation__eyebrow">
            تم تحديد الخدمة
          </span>

          <h2>
            {serviceName}
          </h2>

          <p>
            عبر منصة {platformName}
          </p>
        </div>
      </div>

      <div className="premium-service-confirmation__summary">
        <div className="premium-service-confirmation__summary-heading">
          <span>
            الخطوة التالية
          </span>

          <strong>
            نجهز طلبك للمختص
          </strong>
        </div>

        <div className="premium-service-confirmation__steps">
          <div className="premium-service-confirmation__step">
            <span aria-hidden="true">
              1
            </span>

            <div>
              <strong>
                تم اختيار الخدمة
              </strong>

              <p>
                سنحتفظ بالخدمة المختارة داخل سياق المحادثة.
              </p>
            </div>
          </div>

          <div className="premium-service-confirmation__step">
            <span aria-hidden="true">
              2
            </span>

            <div>
              <strong>
                استكمال التفاصيل
              </strong>

              <p>
                المختص يكمل معك حسب حالة طلبك واحتياجك.
              </p>
            </div>
          </div>

          <div className="premium-service-confirmation__step">
            <span aria-hidden="true">
              3
            </span>

            <div>
              <strong>
                المتابعة من نفس المحادثة
              </strong>

              <p>
                لا تحتاج لإعادة شرح الخدمة من البداية.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-service-confirmation__note">
        <span aria-hidden="true">
          ✦
        </span>

        <p>
          سنطلب فقط المعلومات الناقصة قبل تحويلك للمختص.
        </p>
      </div>

      <div className="service-confirmation__actions premium-service-confirmation__actions">
        <button
          type="button"
          className="service-confirmation__primary premium-service-confirmation__primary"
          onClick={onRequestSpecialist}
        >
          <span aria-hidden="true">
            👤
          </span>

          <span>
            متابعة مع مختص
          </span>

          <span aria-hidden="true">
            ←
          </span>
        </button>

        <button
          type="button"
          className="service-confirmation__secondary premium-service-confirmation__secondary"
          onClick={onBackToServices}
        >
          اختيار خدمة أخرى
        </button>
      </div>
    </section>
  )
}
