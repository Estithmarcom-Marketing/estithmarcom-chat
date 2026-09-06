export const CHAT_ENTRY_OPEN_MESSAGE = 'estithmarcom.chat.open'
export const CHAT_ENTRY_READY_MESSAGE = 'estithmarcom.chat.ready'
export const CHAT_ENTRY_STATE_MESSAGE = 'estithmarcom.chat.state'
export const CHAT_ENTRY_PROTOCOL_VERSION = 1

export type ChatEntryTargetType = 'category' | 'group' | 'service'
export type ChatEntryLocale = 'ar' | 'en'
export type ChatEntryViewState = 'closed' | 'open' | 'minimized'

export interface ChatEntryRequest {
  targetType: ChatEntryTargetType
  targetId: string
  source?: string
  websiteServiceId?: string
  pageUrl?: string
  locale?: ChatEntryLocale
  requestId?: string
}

export interface ChatEntryCommand {
  revision: number
  request: ChatEntryRequest
}

export interface ChatEntryCatalogCategory {
  id: string
  title: string
}

export interface ChatEntryCatalogGroup {
  id: string
  categoryId: string
  title: string
  directServiceId?: string
}

export interface ChatEntryCatalogService {
  id: string
  categoryId: string
  groupId: string
  title: string
}

export interface ChatEntryCatalogLookup {
  getCategoryById: (categoryId: string) => ChatEntryCatalogCategory | undefined
  getGroupById: (groupId: string) => ChatEntryCatalogGroup | undefined
  getServiceById: (serviceId: string) => ChatEntryCatalogService | undefined
}

export interface ResolvedChatEntry {
  categoryId: string
  groupId?: string
  serviceId?: string
  selectedService?: {
    categoryId: string
    categoryName: string
    platformId: string
    platformName: string
    serviceId: string
    serviceName: string
  }
}

interface ChatEntryMessageEnvelope {
  type: typeof CHAT_ENTRY_OPEN_MESSAGE
  version: typeof CHAT_ENTRY_PROTOCOL_VERSION
  payload: ChatEntryRequest
}

export interface ChatEntryStateMessageEnvelope {
  type: typeof CHAT_ENTRY_STATE_MESSAGE
  version: typeof CHAT_ENTRY_PROTOCOL_VERSION
  payload: {
    state: ChatEntryViewState
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readIdentifier(value: unknown, maximumLength = 128): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  if (!normalized || normalized.length > maximumLength) return undefined
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(normalized)) return undefined
  return normalized
}

function readWebsiteServiceId(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) {
    return String(value)
  }
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  if (!/^\d{1,32}$/.test(normalized)) return undefined
  return normalized
}

function readLocale(value: unknown): ChatEntryLocale | undefined {
  return value === 'ar' || value === 'en' ? value : undefined
}

function readPageUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  if (!normalized || normalized.length > 2048) return undefined
  if (normalized.startsWith('/') && !normalized.startsWith('//')) return normalized
  try {
    const url = new URL(normalized)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

export function parseChatEntryPayload(value: unknown): ChatEntryRequest | null {
  if (!isRecord(value)) return null

  const targetType = value.targetType
  if (targetType !== 'category' && targetType !== 'group' && targetType !== 'service') {
    return null
  }

  const targetId = readIdentifier(value.targetId)
  if (!targetId) return null

  const source = value.source === undefined
    ? undefined
    : readIdentifier(value.source, 64)
  if (value.source !== undefined && !source) return null

  const websiteServiceId = value.websiteServiceId === undefined
    ? undefined
    : readWebsiteServiceId(value.websiteServiceId)
  if (value.websiteServiceId !== undefined && !websiteServiceId) return null

  const pageUrl = value.pageUrl === undefined
    ? undefined
    : readPageUrl(value.pageUrl)
  if (value.pageUrl !== undefined && !pageUrl) return null

  const locale = value.locale === undefined
    ? undefined
    : readLocale(value.locale)
  if (value.locale !== undefined && !locale) return null

  const requestId = value.requestId === undefined
    ? undefined
    : readIdentifier(value.requestId, 128)
  if (value.requestId !== undefined && !requestId) return null

  return {
    targetType,
    targetId,
    ...(source ? { source } : {}),
    ...(websiteServiceId ? { websiteServiceId } : {}),
    ...(pageUrl ? { pageUrl } : {}),
    ...(locale ? { locale } : {}),
    ...(requestId ? { requestId } : {}),
  }
}

export function parseChatEntryMessage(value: unknown): ChatEntryRequest | null {
  if (!isRecord(value)) return null
  if (value.type !== CHAT_ENTRY_OPEN_MESSAGE) return null
  if (value.version !== CHAT_ENTRY_PROTOCOL_VERSION) return null
  return parseChatEntryPayload(value.payload)
}

export function parseChatEntrySearch(search: string): ChatEntryRequest | null {
  const params = new URLSearchParams(search)
  const targetType = params.get('chat_target_type')
  const targetId = params.get('chat_target_id')
  if (!targetType || !targetId) return null

  return parseChatEntryPayload({
    targetType,
    targetId,
    source: params.get('chat_source') ?? undefined,
    websiteServiceId: params.get('website_service_id') ?? undefined,
    pageUrl: params.get('page_url') ?? undefined,
    locale: params.get('locale') ?? undefined,
    requestId: params.get('request_id') ?? undefined,
  })
}

export function parseAllowedParentOrigins(value?: string): string[] {
  if (!value) return []
  const origins = new Set<string>()

  for (const candidate of value.split(',')) {
    const normalized = candidate.trim()
    if (!normalized || normalized === '*') continue
    try {
      const url = new URL(normalized)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') continue
      if (url.pathname !== '/' || url.search || url.hash) continue
      origins.add(url.origin)
    } catch {
      // Ignore malformed entries; an empty allowlist fails closed.
    }
  }

  return [...origins]
}

export function isAllowedParentOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin)
}

export function createChatEntryMessage(request: ChatEntryRequest): ChatEntryMessageEnvelope {
  return {
    type: CHAT_ENTRY_OPEN_MESSAGE,
    version: CHAT_ENTRY_PROTOCOL_VERSION,
    payload: request,
  }
}

export function getChatEntryViewState(
  isOpen: boolean,
  isMinimized: boolean,
): ChatEntryViewState {
  if (!isOpen) return 'closed'
  return isMinimized ? 'minimized' : 'open'
}

export function createChatEntryStateMessage(
  state: ChatEntryViewState,
): ChatEntryStateMessageEnvelope {
  return {
    type: CHAT_ENTRY_STATE_MESSAGE,
    version: CHAT_ENTRY_PROTOCOL_VERSION,
    payload: { state },
  }
}

export function resolveChatEntry(
  request: ChatEntryRequest,
  catalog: ChatEntryCatalogLookup,
): ResolvedChatEntry | null {
  if (request.targetType === 'category') {
    const category = catalog.getCategoryById(request.targetId)
    return category ? { categoryId: category.id } : null
  }

  if (request.targetType === 'group') {
    const group = catalog.getGroupById(request.targetId)
    if (!group) return null
    const category = catalog.getCategoryById(group.categoryId)
    if (!category) return null

    if (!group.directServiceId) {
      return { categoryId: category.id, groupId: group.id }
    }

    const service = catalog.getServiceById(group.directServiceId)
    if (!service || service.categoryId !== category.id || service.groupId !== group.id) {
      return null
    }

    return {
      categoryId: category.id,
      groupId: group.id,
      serviceId: service.id,
      selectedService: {
        categoryId: category.id,
        categoryName: category.title,
        platformId: group.id,
        platformName: group.title,
        serviceId: service.id,
        serviceName: service.title,
      },
    }
  }

  const service = catalog.getServiceById(request.targetId)
  if (!service) return null
  const group = catalog.getGroupById(service.groupId)
  const category = catalog.getCategoryById(service.categoryId)
  if (!group || !category || group.categoryId !== category.id) return null

  return {
    categoryId: category.id,
    groupId: group.id,
    serviceId: service.id,
    selectedService: {
      categoryId: category.id,
      categoryName: category.title,
      platformId: group.id,
      platformName: group.title,
      serviceId: service.id,
      serviceName: service.title,
    },
  }
}
