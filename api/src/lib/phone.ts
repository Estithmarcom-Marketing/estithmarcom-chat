import {
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js'

const DEFAULT_PHONE_COUNTRY: CountryCode =
  'DE'

export function normalizePhoneNumber(
  value: string | undefined,
  defaultCountry: CountryCode =
    DEFAULT_PHONE_COUNTRY,
): string | undefined {
  const input =
    value?.trim()

  if (!input) {
    return undefined
  }

  const phoneNumber =
    parsePhoneNumberFromString(
      input,
      defaultCountry,
    )

  if (
    !phoneNumber ||
    !phoneNumber.isValid()
  ) {
    return undefined
  }

  return phoneNumber.number
}