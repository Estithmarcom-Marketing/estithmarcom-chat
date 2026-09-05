export const env = {
  appEnv: import.meta.env.VITE_APP_ENV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  embedAllowedOrigins:
    import.meta.env.VITE_EMBED_ALLOWED_ORIGINS,

  isDevelopment:
    import.meta.env.VITE_APP_ENV === 'development',

  isStaging:
    import.meta.env.VITE_APP_ENV === 'staging',

  isProduction:
    import.meta.env.VITE_APP_ENV === 'production',
} as const
