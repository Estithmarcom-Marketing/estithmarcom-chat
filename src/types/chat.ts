export type Locale = 'ar' | 'en'

export type ChatMode =
  | 'assistant'
  | 'handoff_pending'
  | 'human'

export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'

export type MessageAuthor =
  | 'customer'
  | 'assistant'
  | 'human'
  | 'system'

export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'failed'

export interface ChatMessage {
  id: string
  author: MessageAuthor
  content: string
  createdAt: string
  status?: MessageStatus
  contentType?: string
  contentAttributes?: Record<string, unknown>
}

export interface CustomerContact {
  name?: string
  phone?: string
  email?: string
}

export interface SelectedServiceContext {
  categoryId?: string
  categoryName?: string

  platformId?: string
  platformName?: string

  serviceId?: string
  serviceName?: string
}

export interface ConversationContext {
  conversationId?: string
  locale: Locale
  mode: ChatMode
  contact: CustomerContact
  service: SelectedServiceContext
  originalQuestion?: string
  intent?: string
  handoffReason?: string
  preferredContactTime?: string
}
