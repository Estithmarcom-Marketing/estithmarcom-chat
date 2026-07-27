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

  requestTimeoutMs:
    10_000,
}