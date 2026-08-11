import {
  Breadcrumb,
} from './Breadcrumb'

interface ServiceConfirmationScreenProps {
  serviceName: string
  groupName: string
  onHome?: () => void
  onBackToServices?: () => void
  onRequestSpecialist?: () => void
}

export function ServiceConfirmationScreen({
  serviceName,
  groupName,
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
            label: groupName,
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
            ممتاز، فهمت طلبك 👍
          </span>

          <h2>
            {serviceName}
          </h2>

          <p>
            ضمن مسار «{groupName}»
          </p>
        </div>
      </div>

      <div className="premium-service-confirmation__summary">
        <div className="premium-service-confirmation__summary-heading">
          <span>
            الخطوة التالية
          </span>

          <strong>
            أوصلك للمختص المناسب
          </strong>
        </div>

        <div className="premium-service-confirmation__steps">
          <div className="premium-service-confirmation__step">
            <span aria-hidden="true">
              1
            </span>

            <div>
              <strong>
                الخدمة أصبحت واضحة
              </strong>

              <p>
                حفظت اختيارك حتى لا تحتاج لإعادة شرح طلبك للموظف.
              </p>
            </div>
          </div>

          <div className="premium-service-confirmation__step">
            <span aria-hidden="true">
              2
            </span>

            <div>
              <strong>
                أحتاج فقط بيانات التواصل الناقصة
              </strong>

              <p>
                سنطلب الاسم ورقم الجوال فقط إذا لم يكونا موجودين لدينا.
              </p>
            </div>
          </div>

          <div className="premium-service-confirmation__step">
            <span aria-hidden="true">
              3
            </span>

            <div>
              <strong>
                نكمل من نفس النقطة
              </strong>

              <p>
                بعد اكتمال البيانات، أحولك مباشرة للمختص ليكمل معك من هنا.
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
          لن نكرر عليك المعلومات الموجودة، وسنطلب فقط ما نحتاجه لإكمال التحويل.
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
            متابعة مع المختص
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
