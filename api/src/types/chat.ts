export type Locale = 'ar' | 'en'

export type ChatMode =
  | 'assistant'
  | 'handoff_pending'
  | 'human'

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
  conversationId: string
  locale: Locale
  mode: ChatMode
  contact: CustomerContact
  service: SelectedServiceContext
  originalQuestion?: string
  intent?: string
  handoffReason?: string
  preferredContactTime?: string
}

export interface StartSessionResult {
  context: ConversationContext
  messages: ChatMessage[]
}

export interface LoadConversationResult {
  context: ConversationContext
  messages: ChatMessage[]
}

export interface SendCustomerMessageInput {
  publicSessionId: string
  content: string
}

export interface UpdateServiceInput {
  publicSessionId: string
  service: {
    categoryId: string
    categoryName: string
    platformId: string
    platformName: string
    serviceId: string
    serviceName: string
  }
}

export interface UpdateContactInput {
  publicSessionId: string
  contact: Partial<CustomerContact>
}

export interface RequestHandoffInput {
  publicSessionId: string
  handoffReason?: string
  originalQuestion?: string
  intent?: string
}

export interface PreferredContactTimeInput {
  publicSessionId: string
  preferredContactTime: string
}