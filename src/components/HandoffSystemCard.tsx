interface HandoffSystemCardProps {
  variant:
    | 'handoff-complete'
    | 'waiting'
}

export function HandoffSystemCard({
  variant,
}: HandoffSystemCardProps) {
  if (variant === 'handoff-complete') {
    return (
      <section className="handoff-card premium-handoff-card premium-handoff-card--complete">
        <div
          className="premium-handoff-card__icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <div className="premium-handoff-card__content">
          <span className="premium-handoff-card__eyebrow">
            تم تسليم المحادثة
          </span>

          <h2>
            تم تحويل طلبك
          </h2>

          <p>
            تم توصيل المحادثة بفريق استثماركوم بنجاح.
          </p>

          <div className="premium-handoff-card__meta">
            <span>
              ✓ الخدمة محفوظة
            </span>

            <span>
              ✓ بياناتك محفوظة
            </span>

            <span>
              ✓ لا حاجة لإعادة الشرح
            </span>
          </div>

          <div className="premium-handoff-card__note">
            <span aria-hidden="true">
              ↳
            </span>

            <span>
              سيكمل المختص معك هنا من نفس النقطة.
            </span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="handoff-card premium-handoff-card premium-handoff-card--waiting">
      <div
        className="premium-handoff-card__icon"
        aria-hidden="true"
      >
        ◷
      </div>

      <div className="premium-handoff-card__content">
        <span className="premium-handoff-card__eyebrow">
          الطلب لدى الفريق
        </span>

        <h2>
          بانتظار المختص
        </h2>

        <p>
          طلبك محفوظ ويمكنك إضافة أي ملاحظة أثناء الانتظار.
        </p>

        <div className="premium-handoff-card__note">
          <span aria-hidden="true">
            ✦
          </span>

          <span>
            سنبقيك في نفس المحادثة حتى يبدأ المختص بالرد.
          </span>
        </div>
      </div>
    </section>
  )
}
