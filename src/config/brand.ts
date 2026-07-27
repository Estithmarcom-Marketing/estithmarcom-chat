export const brandConfig = {
  brandName: 'استثماركوم',
  assistantName: 'مساعد استثماركوم',
  teamName: 'فريق استثماركوم',

  logo: '/brand/logo.svg',

  primaryColor: '#412957',
  accentColor: '#ceae5f',

  welcomeTitle: 'أهلاً بك في استثماركوم 👋',
  welcomeMessage: 'نوصلّك للخدمة المناسبة بخطوات بسيطة.',

  specialistLabel: 'مختص',

  defaultLocale: 'ar',

  featureFlags: {
    englishEnabled: false,
    attachmentsEnabled: false,
    voiceEnabled: false,
    darkModeEnabled: false,
  },
} as const

export type BrandConfig = typeof brandConfig
