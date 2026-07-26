export const featureFlags = {
  englishEnabled: false,
  attachmentsEnabled: false,
  voiceEnabled: false,
  darkModeEnabled: false,
} as const

export type FeatureFlags = typeof featureFlags
