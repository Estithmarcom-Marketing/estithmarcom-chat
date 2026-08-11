import {
  type FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js'

import type {
  CountryCode,
} from 'libphonenumber-js'

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

  onBack?: () => void
}

const fieldConfig = {
  name: {
    step: '1',
    eyebrow:
      'خطوة بسيطة قبل التحويل',
    title:
      'كيف تحب أن نخاطبك؟',
    description:
      'اكتب اسمك الأول أو الاسم الذي تفضله، وبعدها نكمل مباشرة.',
    placeholder:
      'اكتب الاسم',
    inputType:
      'text',
    inputMode:
      'text',
    autoComplete:
      'name',
    icon:
      '👤',
    direction:
      'rtl',
  },

  phone: {
    step: '2',
    eyebrow:
      'باقي خطوة واحدة',
    title:
      'ما رقم الجوال المناسب للتواصل معك؟',
    description:
      'اختر الدولة ثم اكتب رقم الجوال، وسنحفظه بالصيغة الدولية الصحيحة.',
    placeholder:
      'Enter mobile number',
    inputType:
      'tel',
    inputMode:
      'tel',
    autoComplete:
      'tel',
    icon:
      '☎',
    direction:
      'ltr',
  },

  email: {
    step: '3',
    eyebrow:
      'بيانات إضافية',
    title:
      'ما بريدك الإلكتروني؟',
    description:
      'إذا احتجناه لإكمال الطلب، يمكنك إضافته هنا.',
    placeholder:
      'name@example.com',
    inputType:
      'email',
    inputMode:
      'email',
    autoComplete:
      'email',
    icon:
      '✉',
    direction:
      'ltr',
  },
} as const

function getCountryFlag(
  countryCode: string,
) {
  return countryCode
    .toUpperCase()
    .replace(
      /./g,
      (character) =>
        String.fromCodePoint(
          127397 +
            character.charCodeAt(0),
        ),
    )
}

export function ContactEnrichment({
  field,
  onSubmit,
  onBack,
}: ContactEnrichmentProps) {
  const [
    value,
    setValue,
  ] = useState('')

  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState<CountryCode>('SA')

  const [
    countryOpen,
    setCountryOpen,
  ] = useState(false)

  const [
    countrySearch,
    setCountrySearch,
  ] = useState('')

  const config =
    fieldConfig[field]

  const cleanValue =
    value.trim()

  const countryNames =
    useMemo(
      () =>
        new Intl.DisplayNames(
          ['en'],
          {
            type: 'region',
          },
        ),
      [],
    )

  const countries =
    useMemo(
      () =>
        getCountries()
          .map(
            (
              countryCode,
            ) => ({
              code:
                countryCode,

              name:
                countryNames.of(
                  countryCode,
                ) ??
                countryCode,

              callingCode:
                getCountryCallingCode(
                  countryCode,
                ),

              flag:
                getCountryFlag(
                  countryCode,
                ),
            }),
          )
          .sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                'en',
              ),
          ),
      [
        countryNames,
      ],
    )

  const selectedCountryData =
    countries.find(
      (country) =>
        country.code ===
        selectedCountry,
    )

  const normalizedCountrySearch =
    countrySearch
      .trim()
      .toLowerCase()
      .replace(
        /^\+/,
        '',
      )

  const filteredCountries =
    normalizedCountrySearch
      ? countries.filter(
          (country) =>
            country.name
              .toLowerCase()
              .includes(
                normalizedCountrySearch,
              ) ||
            country.code
              .toLowerCase()
              .includes(
                normalizedCountrySearch,
              ) ||
            country.callingCode
              .includes(
                normalizedCountrySearch,
              ),
        )
      : countries

  const parsedPhone =
    field === 'phone' &&
    cleanValue
      ? parsePhoneNumberFromString(
          cleanValue,
          selectedCountry,
        )
      : undefined

  const phoneIsValid =
    field !== 'phone' ||
    Boolean(
      parsedPhone?.isValid(),
    )

  const fieldIsValid =
    cleanValue.length > 0 &&
    phoneIsValid

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!fieldIsValid) {
      return
    }

    const submittedValue =
      field === 'phone' &&
      parsedPhone
        ? parsedPhone.number
        : cleanValue

    onSubmit?.(
      field,
      submittedValue,
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
        {field === 'phone' ? (
          <>
            <div className="premium-phone-layout">
              <div className="premium-phone-layout__country">
                <span className="premium-phone-layout__label">
                  الدولة
                </span>

                <div className="premium-phone-country">
                  <button
                    type="button"
                    className="premium-phone-country__trigger"
                    onClick={() =>
                      setCountryOpen(
                        (current) =>
                          !current,
                      )
                    }
                    aria-expanded={
                      countryOpen
                    }
                  >
                    <span className="premium-phone-country__flag">
                      {
                        selectedCountryData
                          ?.flag
                      }
                    </span>

                    <strong className="premium-phone-country__calling-code">
                      +
                      {
                        selectedCountryData
                          ?.callingCode
                      }
                    </strong>

                    <span
                      className="premium-phone-country__chevron"
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>

                  {countryOpen && (
                    <div className="premium-phone-country__menu">
                      <div className="premium-phone-country__search">
                        <span
                          className="premium-phone-country__search-icon"
                          aria-hidden="true"
                        >
                          ⌕
                        </span>

                        <input
                          type="search"
                          value={
                            countrySearch
                          }
                          dir="ltr"
                          autoComplete="off"
                          placeholder="Search country or code"
                          aria-label="Search country or calling code"
                          onChange={(
                            event,
                          ) =>
                            setCountrySearch(
                              event.target
                                .value,
                            )
                          }
                        />
                      </div>

                      <div className="premium-phone-country__list">
                        {filteredCountries.map(
                          (
                            country,
                          ) => (
                            <button
                              key={
                                country.code
                              }
                              type="button"
                              className={[
                                'premium-phone-country__option',
                                country.code ===
                                selectedCountry
                                  ? 'is-active'
                                  : '',
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(
                                  ' ',
                                )}
                              onClick={() => {
                                setSelectedCountry(
                                  country.code,
                                )

                                setCountryOpen(
                                  false,
                                )

                                setCountrySearch(
                                  '',
                                )

                                setValue('')
                              }}
                            >
                              <span className="premium-phone-country__option-flag">
                                {
                                  country.flag
                                }
                              </span>

                              <span className="premium-phone-country__option-name">
                                {
                                  country.name
                                }
                              </span>

                              <span className="premium-phone-country__option-code">
                                +
                                {
                                  country.callingCode
                                }
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <label className="premium-phone-layout__number">
                <span className="premium-phone-layout__label">
                  رقم الجوال
                </span>

                <div className="premium-contact-enrichment__field">
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={value}
                    dir="ltr"
                    onChange={(
                      event,
                    ) =>
                      setValue(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Enter mobile number"
                    aria-label="Enter mobile number"
                  />

                  {fieldIsValid && (
                    <span
                      className="premium-contact-enrichment__valid"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </div>
              </label>
            </div>

            {cleanValue &&
              !phoneIsValid && (
                <span className="premium-contact-enrichment__phone-error">
                  تأكد من رقم الجوال بحسب الدولة المختارة.
                </span>
              )}
          </>
        ) : (
          <div className="premium-contact-enrichment__field">
            <input
              type={
                config.inputType
              }
              inputMode={
                config.inputMode
              }
              autoComplete={
                config.autoComplete
              }
              value={value}
              dir={
                config.direction
              }
              onChange={(
                event,
              ) =>
                setValue(
                  event.target
                    .value,
                )
              }
              placeholder={
                config.placeholder
              }
              aria-label={
                config.placeholder
              }
            />

            {fieldIsValid && (
              <span
                className="premium-contact-enrichment__valid"
                aria-hidden="true"
              >
                ✓
              </span>
            )}
          </div>
        )}

        <button
          type="submit"
          className="premium-contact-enrichment__submit"
          disabled={
            !fieldIsValid
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

      {onBack && (
        <button
          type="button"
          className="premium-contact-enrichment__back"
          onClick={
            onBack
          }
        >
          <span aria-hidden="true">
            →
          </span>

          <span>
            الرجوع إلى الخدمة
          </span>
        </button>
      )}

      <div className="premium-contact-enrichment__trust">
        <span aria-hidden="true">
          🔒
        </span>

        <span>
          نطلب فقط المعلومات الناقصة، ونحافظ على ما شاركته معنا حتى لا تضطر لتكراره.
        </span>
      </div>
    </section>
  )
}
