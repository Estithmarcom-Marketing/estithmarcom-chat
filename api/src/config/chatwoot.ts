function requireEnvironmentVariable(
  name: string,
): string {
  const value =
    process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    )
  }

  return value
}

function normalizeBaseUrl(
  value: string,
): string {
  return value.replace(
    /\/+$/,
    '',
  )
}

function requirePositiveIntegerEnvironmentVariable(
  name: string,
): number {
  const rawValue =
    requireEnvironmentVariable(
      name,
    )

  const value =
    Number(rawValue)

  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      `Environment variable ${name} must be a positive integer`,
    )
  }

  return value
}

export const chatwootConfig = {
  baseUrl:
    normalizeBaseUrl(
      requireEnvironmentVariable(
        'CHATWOOT_BASE_URL',
      ),
    ),

  apiAccessToken:
    requireEnvironmentVariable(
      'CHATWOOT_API_ACCESS_TOKEN',
    ),

  websiteToken:
    requireEnvironmentVariable(
      'CHATWOOT_WEBSITE_TOKEN',
    ),

  accountId:
    requirePositiveIntegerEnvironmentVariable(
      'CHATWOOT_ACCOUNT_ID',
    ),

  requestTimeoutMs:
    10_000,
}
