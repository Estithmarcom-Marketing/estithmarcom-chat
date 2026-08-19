import { useMemo, useState, type FormEvent } from 'react'
import { Check, ChevronLeft, Search } from 'lucide-react'
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

export type ContactField = 'name' | 'phone' | 'email'

interface ContactEnrichmentProps {
  field: ContactField
  onSubmit?: (field: ContactField, value: string) => void
  onBack?: () => void
}

const fieldConfig = {
  name: {
    step: '1', eyebrow: 'خطوة بسيطة قبل التحويل', title: 'كيف تحب أن نخاطبك؟',
    description: 'اكتب اسمك الأول أو الاسم الذي تفضله، وبعدها نكمل مباشرة.',
    placeholder: 'اكتب الاسم', inputType: 'text', inputMode: 'text', autoComplete: 'name',
    icon: '👤', direction: 'rtl',
  },
  phone: {
    step: '2', eyebrow: 'باقي خطوة واحدة', title: 'ما رقم الجوال المناسب للتواصل معك؟',
    description: 'اختر الدولة ثم اكتب رقم الجوال، وسنحفظه بالصيغة الدولية الصحيحة.',
    placeholder: 'Enter mobile number', inputType: 'tel', inputMode: 'tel', autoComplete: 'tel',
    icon: '☎', direction: 'ltr',
  },
  email: {
    step: '3', eyebrow: 'بيانات إضافية', title: 'ما بريدك الإلكتروني؟',
    description: 'إذا احتجناه لإكمال الطلب، يمكنك إضافته هنا.',
    placeholder: 'name@example.com', inputType: 'email', inputMode: 'email', autoComplete: 'email',
    icon: '✉', direction: 'ltr',
  },
} as const

function getCountryFlag(countryCode: string) {
  return countryCode.toUpperCase().replace(/./g, (character) =>
    String.fromCodePoint(127397 + character.charCodeAt(0)),
  )
}

export function ContactEnrichment({
  field,
  onSubmit,
  onBack,
}: ContactEnrichmentProps) {
  const [value, setValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('SA')
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')

  const config = fieldConfig[field]
  const cleanValue = value.trim()

  const countryNames = useMemo(
    () => new Intl.DisplayNames(['en'], { type: 'region' }),
    [],
  )

  const countries = useMemo(
    () =>
      getCountries()
        .map((countryCode) => ({
          code: countryCode,
          name: countryNames.of(countryCode) ?? countryCode,
          callingCode: getCountryCallingCode(countryCode),
          flag: getCountryFlag(countryCode),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'en')),
    [countryNames],
  )

  const selectedCountryData = countries.find((c) => c.code === selectedCountry)
  const normalizedCountrySearch = countrySearch.trim().toLowerCase().replace(/^\+/, '')
  const filteredCountries = normalizedCountrySearch
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedCountrySearch) ||
          c.code.toLowerCase().includes(normalizedCountrySearch) ||
          c.callingCode.includes(normalizedCountrySearch),
      )
    : countries

  const parsedPhone =
    field === 'phone' && cleanValue
      ? parsePhoneNumberFromString(cleanValue, selectedCountry)
      : undefined

  const phoneIsValid = field !== 'phone' || Boolean(parsedPhone?.isValid())
  const fieldIsValid = cleanValue.length > 0 && phoneIsValid

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fieldIsValid) return
    const submittedValue = field === 'phone' && parsedPhone ? parsedPhone.number : cleanValue
    onSubmit?.(field, submittedValue)
    setValue('')
  }

  return (
    <div className="mb-3 animate-chat-fade-up">
      <div className="flex items-start gap-2.5 mb-2 px-4 py-3 bg-gray-50 rounded-xl">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-secondary">{config.eyebrow}</span>
            <span className="text-[10px] font-bold text-text-muted bg-white rounded-full px-2 py-0.5">{config.step}/3</span>
          </div>
          <strong className="text-sm font-bold text-gray-800 block mt-0.5">{config.title}</strong>
          <p className="text-[11px] text-text-muted mt-0.5">{config.description}</p>
        </div>
      </div>

      <form className="flex flex-col gap-2.5 px-4" onSubmit={handleSubmit}>
        {field === 'phone' ? (
          <>
            <div className="grid grid-cols-[minmax(110px,0.9fr)_minmax(0,1.2fr)] gap-2.5 items-end w-full" dir="ltr">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-bold text-text-muted text-left">الدولة</span>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 w-full h-[46px] px-2.5 rounded-xl border border-gray-300 bg-white text-left text-sm cursor-pointer hover:border-secondary/50 transition-colors"
                    onClick={() => setCountryOpen((c) => !c)}
                    aria-expanded={countryOpen}
                  >
                    <span className="text-lg leading-none">{selectedCountryData?.flag}</span>
                    <strong className="flex-1 min-w-0 text-xs font-bold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                      +{selectedCountryData?.callingCode}
                    </strong>
                    <ChevronLeft className="w-3 h-3 text-text-muted rtl:rotate-180" />
                  </button>

                  {countryOpen && (
                    <div className="absolute z-40 top-[calc(100%+6px)] start-0 w-[min(300px,calc(100vw-62px))] p-2 rounded-xl border border-gray-200 bg-white shadow-2xl animate-slide-down">
                      <div className="relative flex items-center mb-2">
                        <Search className="absolute start-2.5 w-4 h-4 text-text-muted pointer-events-none" />
                        <input
                          type="search"
                          value={countrySearch}
                          dir="ltr"
                          autoComplete="off"
                          placeholder="Search country or code"
                          aria-label="Search country or calling code"
                          className="w-full h-9 ps-8 pe-3 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                          onChange={(e) => setCountrySearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className={`flex items-center gap-2 w-full min-h-[36px] px-2 py-1.5 rounded-lg bg-transparent text-left text-xs transition-colors ${
                              country.code === selectedCountry ? 'bg-secondary/10' : 'hover:bg-secondary/5'
                            }`}
                            onClick={() => {
                              setSelectedCountry(country.code)
                              setCountryOpen(false)
                              setCountrySearch('')
                              setValue('')
                            }}
                          >
                            <span className="text-base leading-none">{country.flag}</span>
                            <span className="flex-1 min-w-0 font-bold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">{country.name}</span>
                            <span className="min-w-[36px] text-[10px] font-bold text-text-muted text-right" dir="ltr">+{country.callingCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <label className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-bold text-text-muted text-left">رقم الجوال</span>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={value}
                    dir="ltr"
                    className="w-full h-[46px] px-3.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                    placeholder="Enter mobile number"
                    aria-label="Enter mobile number"
                    onChange={(e) => setValue(e.target.value)}
                  />
                  {fieldIsValid && (
                    <span className="absolute top-1/2 -translate-y-1/2 start-3 text-green-500"><Check className="w-4 h-4" /></span>
                  )}
                </div>
              </label>
            </div>

            {cleanValue && !phoneIsValid && (
              <span className="block text-[10px] leading-normal text-red-500 px-1">
                تأكد من رقم الجوال بحسب الدولة المختارة.
              </span>
            )}
          </>
        ) : (
          <div className="relative">
            <input
              type={config.inputType}
              inputMode={config.inputMode}
              autoComplete={config.autoComplete}
              value={value}
              dir={config.direction}
              className="w-full h-[46px] px-3.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              placeholder={config.placeholder}
              aria-label={config.placeholder}
              onChange={(e) => setValue(e.target.value)}
            />
            {fieldIsValid && (
              <span className="absolute top-1/2 -translate-y-1/2 start-3 text-green-500"><Check className="w-4 h-4" /></span>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!fieldIsValid}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>متابعة</span>
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
      </form>

      {onBack && (
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full mt-2 py-2 text-xs font-semibold text-text-muted hover:text-gray-800 transition-colors cursor-pointer"
          onClick={onBack}
        >
          <ChevronLeft className="w-3 h-3 rotate-180 rtl:rotate-0" />
          <span>الرجوع إلى الخدمة</span>
        </button>
      )}

      <div className="flex items-start gap-2 mx-4 mt-2 px-3 py-2.5 bg-gray-50 rounded-xl text-[11px] text-text-muted leading-relaxed">
        <span aria-hidden="true">🔒</span>
        <span>نطلب فقط المعلومات الناقصة، ونحافظ على ما شاركته معنا حتى لا تضطر لتكراره.</span>
      </div>
    </div>
  )
}
