import {
  useState,
  type FormEvent,
} from 'react'

export type ContactField =
  | 'name'
  | 'phone'
  | 'email'

interface ContactEnrichmentProps {
  field: ContactField

  onSubmit?: (
    field: ContactField,
    value: string,
  ) => void
}

const fieldConfig = {
  name: {
    step: '1',
    eyebrow: 'تعريف بسيط',
    title: 'كيف تحب نخاطبك؟',
    description:
      'يكفينا اسمك الأول أو الاسم الذي تفضله.',
    placeholder: 'اكتب الاسم',
    inputType: 'text',
    inputMode: 'text',
    autoComplete: 'name',
    icon: '👤',
    direction: 'rtl',
  },

  phone: {
    step: '2',
    eyebrow: 'بيانات التواصل',
    title: 'ما رقم الجوال المناسب؟',
    description:
      'نستخدمه فقط لمتابعة طلبك عند الحاجة.',
    placeholder: 'مثال: 05xxxxxxxx',
    inputType: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
    icon: '☎',
    direction: 'ltr',
  },

  email: {
    step: '3',
    eyebrow: 'آخر خطوة',
    title: 'ما بريدك الإلكتروني؟',
    description:
      'يساعد الفريق على استكمال بيانات الطلب.',
    placeholder: 'name@example.com',
    inputType: 'email',
    inputMode: 'email',
    autoComplete: 'email',
    icon: '✉',
    direction: 'ltr',
  },
} as const

export function ContactEnrichment({
  field,
  onSubmit,
}: ContactEnrichmentProps) {
  const [
    value,
    setValue,
  ] = useState('')

  const config =
    fieldConfig[field]

  const cleanValue =
    value.trim()

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!cleanValue) {
      return
    }

    onSubmit?.(
      field,
      cleanValue,
    )

    setValue('')
  }

  return (
    <section className="contact-enrichment premium-contact-enrichment">
      <div className="premium-contact-enrichment__top">
        <div className="premium-contact-enrichment__identity">
          <span
            className="premium-contact-enrichment__icon"
            aria-hidden="true"
          >
            {config.icon}
          </span>

          <div>
            <span className="premium-contact-enrichment__eyebrow">
              {config.eyebrow}
            </span>

            <strong className="premium-contact-enrichment__title">
              {config.title}
            </strong>
          </div>
        </div>

        <span className="premium-contact-enrichment__step">
          {config.step}/3
        </span>
      </div>

      <p className="premium-contact-enrichment__description">
        {config.description}
      </p>

      <form
        className="premium-contact-enrichment__form"
        onSubmit={handleSubmit}
      >
        <div className="premium-contact-enrichment__field">
          <input
            type={config.inputType}
            inputMode={config.inputMode}
            autoComplete={config.autoComplete}
            value={value}
            dir={config.direction}
            onChange={(event) =>
              setValue(
                event.target.value,
              )
            }
            placeholder={
              config.placeholder
            }
            aria-label={
              config.placeholder
            }
          />

          {cleanValue && (
            <span
              className="premium-contact-enrichment__valid"
              aria-hidden="true"
            >
              ✓
            </span>
          )}
        </div>

        <button
          type="submit"
          className="premium-contact-enrichment__submit"
          disabled={
            cleanValue.length === 0
          }
        >
          <span>
            متابعة
          </span>

          <span aria-hidden="true">
            ←
          </span>
        </button>
      </form>

      <div className="premium-contact-enrichment__trust">
        <span aria-hidden="true">
          🔒
        </span>

        <span>
          نطلب فقط المعلومات الناقصة ولا نكرر البيانات الموجودة لدينا.
        </span>
      </div>
    </section>
  )
}
