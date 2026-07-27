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
    hint: 'في أقرب وقت متاح',
    icon: '☀',
  },
  {
    value: 'مساءً',
    title: 'مساءً',
    hint: 'بعد ساعات العمل',
    icon: '☾',
  },
  {
    value: 'غدًا',
    title: 'غدًا',
    hint: 'خلال اليوم التالي',
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
            طلبك محفوظ لدى الفريق
          </span>

          <h2>
            ما نحب نخليك تنتظر
          </h2>

          <p>
            المختص قد يكون مشغولًا الآن، اختر الوقت الأنسب للتواصل معك.
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
          الوقت المفضل
        </span>

        <strong>
          متى يناسبك التواصل؟
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
              اختر وقتًا مناسبًا لك
            </span>
          </span>
        </button>
      </div>

      {customMode && (
        <div className="preferred-contact__custom premium-preferred-contact__custom">
          <label>
            <span>
              اكتب الوقت المناسب
            </span>

            <input
              type="text"
              value={customTime}
              onChange={(event) =>
                setCustomTime(
                  event.target.value,
                )
              }
              placeholder="مثال: اليوم بعد 5 مساءً"
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
          هذا هو الوقت المفضل للتواصل وليس موعدًا مؤكدًا.
        </span>
      </div>
    </section>
  )
}
