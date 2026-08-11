import {
  useState,
} from 'react'

interface PreferredContactTimeProps {
  onSubmit?: (
    preferredTime: string,
  ) => void
}

const quickOptions = [
  {
    value: 'خلال اليوم',
    title: 'خلال اليوم',
    hint: 'يتواصل معك الفريق في أقرب فرصة متاحة',
    icon: '☀',
  },
  {
    value: 'مساءً',
    title: 'مساءً',
    hint: 'يفضل التواصل معك خلال الفترة المسائية',
    icon: '☾',
  },
  {
    value: 'غدًا',
    title: 'غدًا',
    hint: 'يفضل التواصل معك خلال يوم غد',
    icon: '↗',
  },
] as const

export function PreferredContactTime({
  onSubmit,
}: PreferredContactTimeProps) {
  const [
    customMode,
    setCustomMode,
  ] = useState(false)

  const [
    customTime,
    setCustomTime,
  ] = useState('')

  const cleanCustomTime =
    customTime.trim()

  return (
    <section className="preferred-contact premium-preferred-contact">
      <div className="premium-preferred-contact__hero">
        <div
          className="premium-preferred-contact__icon"
          aria-hidden="true"
        >
          ◷
        </div>

        <div>
          <span className="premium-preferred-contact__eyebrow">
            تعذر توصيلك بالمختص الآن
          </span>

          <h2>
            المستشار المختص مشغول في الوقت الحالي
          </h2>

          <p>
            استلمنا طلبك، وسيتم التواصل معك من المستشار المختص. اختر الوقت الأنسب لك.
          </p>
        </div>
      </div>

      <div className="premium-preferred-contact__status">
        <span>
          ✓ الخدمة محددة
        </span>

        <span>
          ✓ طلبك محفوظ
        </span>

        <span>
          ✓ لن تحتاج لإعادة الشرح
        </span>
      </div>

      <div className="premium-preferred-contact__heading">
        <span>
          تحديد وقت التواصل
        </span>

        <strong>
          متى تحب أن يتواصل معك المستشار المختص؟
        </strong>
      </div>

      <div className="preferred-contact__quick premium-preferred-contact__options">
        {quickOptions.map(
          (option) => (
            <button
              key={option.value}
              type="button"
              className="premium-preferred-contact__option"
              onClick={() =>
                onSubmit?.(
                  option.value,
                )
              }
            >
              <span
                className="premium-preferred-contact__option-icon"
                aria-hidden="true"
              >
                {option.icon}
              </span>

              <span className="premium-preferred-contact__option-content">
                <strong>
                  {option.title}
                </strong>

                <span>
                  {option.hint}
                </span>
              </span>
            </button>
          ),
        )}

        <button
          type="button"
          className={[
            'premium-preferred-contact__option',
            'premium-preferred-contact__option--custom',
          ].join(' ')}
          onClick={() =>
            setCustomMode(
              (current) =>
                !current,
            )
          }
        >
          <span
            className="premium-preferred-contact__option-icon"
            aria-hidden="true"
          >
            ◴
          </span>

          <span className="premium-preferred-contact__option-content">
            <strong>
              تحديد وقت
            </strong>

            <span>
              اكتب الوقت الذي يناسبك
            </span>
          </span>
        </button>
      </div>

      {customMode && (
        <div className="preferred-contact__custom premium-preferred-contact__custom">
          <label>
            <span>
              الوقت المناسب للتواصل
            </span>

            <input
              type="text"
              value={customTime}
              onChange={(event) =>
                setCustomTime(
                  event.target.value,
                )
              }
              placeholder="مثال: اليوم الساعة 5 مساءً"
            />
          </label>

          <button
            type="button"
            disabled={
              cleanCustomTime.length === 0
            }
            onClick={() => {
              if (!cleanCustomTime) {
                return
              }

              onSubmit?.(
                cleanCustomTime,
              )
            }}
          >
            <span>
              تسجيل الوقت
            </span>

            <span aria-hidden="true">
              ←
            </span>
          </button>
        </div>
      )}

      <div className="premium-preferred-contact__note">
        <span aria-hidden="true">
          ℹ
        </span>

        <span>
          سنحفظ الوقت الذي تفضله للتواصل، وهو ليس موعدًا مؤكدًا حتى يؤكده المستشار المختص.
        </span>
      </div>
    </section>
  )
}
