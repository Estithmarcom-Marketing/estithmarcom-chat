export interface ServiceCategory {
  category_id: string
  title_ar: string
  display_order: number
  active: boolean
}

export interface ServicePlatform {
  platform_id: string
  category_id: string
  title_ar: string
  display_order: number
  active: boolean
}

export type HandoffPolicy = 'human_first'

export interface CatalogService {
  service_id: string
  platform_id: string
  title_ar: string
  display_order: number
  active: boolean
  handoff_policy: HandoffPolicy
}
